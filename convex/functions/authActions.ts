"use node";

import { v } from "convex/values";
import { Id } from "../_generated/dataModel";
import { action } from "../_generated/server";
import { internal } from "../_generated/api";
import { roleValidator } from "../schema";
import { generatePasswordHash, generateSaltedHash } from "../lib/password";

export const login = action({
  args: {
    email: v.string(),
    password: v.string(),
  },
  handler: async (
    ctx,
    args,
  ): Promise<{
    id: Id<"users">;
    email?: string;
    phoneNumber?: string;
    role?: string;
    locationId?: Id<"locations">;
    hasInitialPasswordChanged?: boolean;
  }> => {
    const user = await ctx.runQuery(internal.functions.auth.getUserByEmail, {
      email: args.email,
    });

    if (!user) {
      throw new Error("User not found");
    }

    if (!user.salt || !user.passwordHash) {
      throw new Error("Invalid user credentials configuration");
    }

    if (generatePasswordHash(args.password, user.salt) !== user.passwordHash) {
      throw new Error("Email and password do not match");
    }

    if (user.status !== "ACTIVE") {
      throw new Error(
        "The user is not active, please contact the administrator",
      );
    }

    console.log("user :>> ", user);

    return {
      id: user._id,
      email: user.email,
      phoneNumber: user.phoneNumber,
      role: user.role,
      locationId: user.locationId,
      hasInitialPasswordChanged: user.hasInitialPasswordChanged,
    };
  },
});

export const registerSuperAdmin = action({
  args: {
    firstName: v.string(),
    middleName: v.optional(v.string()),
    lastName: v.string(),
    email: v.string(),
    phoneNumber: v.string(),
    password: v.string(),
    role: roleValidator,
  },
  handler: async (ctx, args): Promise<{ userId: Id<"users"> }> => {
    if (args.role !== "ADMIN") {
      throw new Error("Only Admins can register");
    }

    const existingAdmin = await ctx.runQuery(
      internal.functions.auth.getFirstAdmin,
    );
    if (existingAdmin) {
      throw new Error("Admin already exists");
    }

    const existingEmail = await ctx.runQuery(
      internal.functions.auth.getUserByEmail,
      { email: args.email },
    );
    const existingPhone = await ctx.runQuery(
      internal.functions.auth.getUserByPhone,
      { phoneNumber: args.phoneNumber },
    );

    if (existingEmail || existingPhone) {
      throw new Error("User already exists");
    }

    const hashAndSalt = generateSaltedHash(args.password);

    const userId = await ctx.runMutation(internal.functions.auth.insertUser, {
      firstName: args.firstName,
      middleName: args.middleName,
      lastName: args.lastName,
      email: args.email,
      phoneNumber: args.phoneNumber,
      passwordHash: hashAndSalt.hash,
      salt: hashAndSalt.salt,
      role: args.role,
    });

    return { userId };
  },
});

export const resetAuthAccount = action({
  args: { email: v.string(), password: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.runQuery(internal.functions.auth.getUserByEmail, {
      email: args.email,
    });
    if (!user || !user.salt || !user.passwordHash) {
      throw new Error("User not found");
    }
    if (generatePasswordHash(args.password, user.salt) !== user.passwordHash) {
      throw new Error("Invalid credentials");
    }
    await ctx.runMutation(internal.functions.users.deleteAuthAccount, {
      userId: user._id,
    });
  },
});
