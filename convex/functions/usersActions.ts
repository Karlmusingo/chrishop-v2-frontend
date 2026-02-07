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
  handler: async (ctx, args): Promise<{
    firstName: string;
    lastName: string;
    email: string;
    role: string;
  }> => {
    const existingByEmail = await ctx.runQuery(
      internal.functions.users.getUserByEmail,
      { email: args.email }
    );
    const existingByPhone = await ctx.runQuery(
      internal.functions.users.getUserByPhone,
      { phoneNumber: args.phoneNumber }
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

export const updatePassword = action({
  args: {
    password: v.string(),
    newPassword: v.string(),
  },
  handler: async (ctx, args): Promise<{ success: boolean }> => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity || !identity.email) throw new Error("Unauthenticated");

    const user = await ctx.runQuery(internal.functions.users.getUserByEmail, {
      email: identity.email,
    });
    if (!user) throw new Error("User not found");

    if (
      generatePasswordHash(args.password, user.salt) !== user.passwordHash
    ) {
      throw new Error("Le password saisi est incorrect");
    }

    const hashAndSalt = generateSaltedHash(args.newPassword);

    await ctx.runMutation(internal.functions.users.patchPassword, {
      userId: user._id,
      passwordHash: hashAndSalt.hash,
      salt: hashAndSalt.salt,
    });

    return { success: true };
  },
});
