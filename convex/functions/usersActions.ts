"use node";

import { v } from "convex/values";
import { action } from "../_generated/server";
import { internal } from "../_generated/api";
import { roleValidator } from "../schema";
import {
  generatePasswordHash,
  generateRandomPassword,
  generateSaltedHash,
} from "../lib/password";

export const create = action({
  args: {
    firstName: v.string(),
    middleName: v.optional(v.string()),
    lastName: v.string(),
    email: v.string(),
    phoneNumber: v.string(),
    role: roleValidator,
    location: v.optional(v.id("locations")),
  },
  handler: async (
    ctx,
    args,
  ): Promise<{
    firstName: string;
    lastName: string;
    email: string;
    role: string;
  }> => {
    const existingByEmail = await ctx.runQuery(
      internal.functions.users.getUserByEmail,
      { email: args.email },
    );
    const existingByPhone = await ctx.runQuery(
      internal.functions.users.getUserByPhone,
      { phoneNumber: args.phoneNumber },
    );

    if (existingByEmail || existingByPhone) {
      throw new Error("User already exists");
    }

    const randomPassword = generateRandomPassword();
    const hashAndSalt = generateSaltedHash(randomPassword);

    await ctx.runMutation(internal.functions.users.insertUser, {
      firstName: args.firstName,
      middleName: args.middleName,
      lastName: args.lastName,
      email: args.email,
      phoneNumber: args.phoneNumber,
      passwordHash: hashAndSalt.hash,
      salt: hashAndSalt.salt,
      role: args.role,
      locationId: args.location,
    });

    await ctx.runAction(internal.functions.email.sendEmail, {
      to: args.email,
      subject: "Welcome to Chrishop",
      text: `Your password is: ${randomPassword}`,
      html: `<b>Your password is: ${randomPassword}</b>`,
    });

    return {
      firstName: args.firstName,
      lastName: args.lastName,
      email: args.email,
      role: args.role,
    };
  },
});

export const resetPassword = action({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args): Promise<{ success: boolean }> => {
    const caller = await ctx.runQuery(
      internal.functions.users.getAuthenticatedUser,
    );
    if (!caller) throw new Error("Unauthenticated");
    if (caller.role !== "ADMIN") throw new Error("Forbidden: insufficient role");

    const targetUser = await ctx.runQuery(
      internal.functions.users.getUserById,
      { userId: args.userId },
    );
    if (!targetUser) throw new Error("User not found");
    if (!targetUser.email) throw new Error("User has no email address");

    const randomPassword = generateRandomPassword();
    const hashAndSalt = generateSaltedHash(randomPassword);

    await ctx.runMutation(internal.functions.users.patchPassword, {
      userId: args.userId,
      passwordHash: hashAndSalt.hash,
      salt: hashAndSalt.salt,
      hasInitialPasswordChanged: false,
    });

    await ctx.runMutation(internal.functions.users.deleteAuthAccount, {
      userId: args.userId,
    });

    await ctx.runAction(internal.functions.email.sendEmail, {
      to: targetUser.email,
      subject: "Chrishop - Réinitialisation du mot de passe",
      html: `<p>Votre mot de passe a été réinitialisé.</p><p><b>Nouveau mot de passe : ${randomPassword}</b></p><p>Vous serez invité à le changer lors de votre prochaine connexion.</p>`,
      text: `Votre mot de passe a été réinitialisé. Nouveau mot de passe : ${randomPassword}. Vous serez invité à le changer lors de votre prochaine connexion.`,
    });

    return { success: true };
  },
});

export const updatePassword = action({
  args: {
    password: v.string(),
    newPassword: v.string(),
  },
  handler: async (ctx, args): Promise<{ success: boolean }> => {
    const user = await ctx.runQuery(
      internal.functions.users.getAuthenticatedUser,
    );
    if (!user) throw new Error("Unauthenticated");

    if (!user.salt || !user.passwordHash) {
      throw new Error("Invalid user credentials configuration");
    }

    if (generatePasswordHash(args.password, user.salt) !== user.passwordHash) {
      throw new Error("Le password saisi est incorrect");
    }

    const hashAndSalt = generateSaltedHash(args.newPassword);

    await ctx.runMutation(internal.functions.users.patchPassword, {
      userId: user._id,
      passwordHash: hashAndSalt.hash,
      salt: hashAndSalt.salt,
    });

    await ctx.runMutation(internal.functions.users.deleteAuthAccount, {
      userId: user._id,
    });

    return { success: true };
  },
});
