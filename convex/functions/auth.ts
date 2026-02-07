import { v } from "convex/values";
import { internalQuery, internalMutation } from "../_generated/server";
import { roleValidator } from "../schema";

export const getUserByEmail = internalQuery({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();
  },
});

export const getUserByPhone = internalQuery({
  args: { phoneNumber: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_phoneNumber", (q) =>
        q.eq("phoneNumber", args.phoneNumber)
      )
      .first();
  },
});

export const getFirstAdmin = internalQuery({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("users")
      .withIndex("by_role", (q) => q.eq("role", "ADMIN"))
      .first();
  },
});

export const insertUser = internalMutation({
  args: {
    firstName: v.string(),
    middleName: v.optional(v.string()),
    lastName: v.string(),
    email: v.string(),
    phoneNumber: v.string(),
    passwordHash: v.string(),
    salt: v.string(),
    role: roleValidator,
    locationId: v.optional(v.id("locations")),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("users", {
      ...args,
      status: "ACTIVE",
      isFirstLogin: true,
    });
  },
});

export const markFirstLogin = internalMutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.userId, { isFirstLogin: false });
  },
});
