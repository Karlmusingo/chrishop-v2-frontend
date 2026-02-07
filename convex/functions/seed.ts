"use node";

import { v } from "convex/values";
import { Id } from "../_generated/dataModel";
import { action } from "../_generated/server";
import { internal } from "../_generated/api";
import { generateSaltedHash } from "../lib/password";

export const seedAdmin = action({
  args: {
    firstName: v.string(),
    lastName: v.string(),
    email: v.string(),
    phoneNumber: v.string(),
    password: v.string(),
  },
  handler: async (ctx, args): Promise<{ userId: Id<"users"> }> => {
    const existingAdmin = await ctx.runQuery(
      internal.functions.auth.getFirstAdmin
    );
    if (existingAdmin) {
      throw new Error("Admin already exists, skipping seed.");
    }

    const existing = await ctx.runQuery(
      internal.functions.auth.getUserByEmail,
      { email: args.email }
    );
    if (existing) {
      throw new Error("A user with this email already exists.");
    }

    const hashAndSalt = generateSaltedHash(args.password);

    const userId = await ctx.runMutation(internal.functions.auth.insertUser, {
      firstName: args.firstName,
      lastName: args.lastName,
      email: args.email,
      phoneNumber: args.phoneNumber,
      passwordHash: hashAndSalt.hash,
      salt: hashAndSalt.salt,
      role: "ADMIN",
    });

    return { userId };
  },
});
