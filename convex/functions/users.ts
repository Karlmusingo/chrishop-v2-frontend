import { v } from "convex/values";
import {
  query,
  mutation,
  internalQuery,
  internalMutation,
} from "../_generated/server";
import { roleValidator, userStatusValidator } from "../schema";

export const list = query({
  args: {
    role: v.optional(roleValidator),
    status: v.optional(userStatusValidator),
    search: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let users = await ctx.db.query("users").collect();

    if (args.role) {
      users = users.filter((u) => u.role === args.role);
    }
    if (args.status) {
      users = users.filter((u) => u.status === args.status);
    }
    if (args.search) {
      const search = args.search.toLowerCase();
      users = users.filter(
        (u) =>
          u.firstName.toLowerCase().includes(search) ||
          (u.middleName && u.middleName.toLowerCase().includes(search)) ||
          u.lastName.toLowerCase().includes(search)
      );
    }

    const usersWithLocation = await Promise.all(
      users.map(async (user) => {
        const location = user.locationId
          ? await ctx.db.get(user.locationId)
          : null;
        return { ...user, location };
      })
    );

    return usersWithLocation;
  },
});

export const getProfile = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity || !identity.email) return null;

    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", identity.email!))
      .first();

    if (!user) return null;

    const location = user.locationId
      ? await ctx.db.get(user.locationId)
      : null;

    return { ...user, location };
  },
});

export const updateProfile = mutation({
  args: {
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    middleName: v.optional(v.string()),
    phoneNumber: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity || !identity.email) throw new Error("Unauthenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", identity.email!))
      .first();
    if (!user) throw new Error("User not found");

    const patch: Record<string, string> = {};
    if (args.firstName !== undefined) patch.firstName = args.firstName;
    if (args.lastName !== undefined) patch.lastName = args.lastName;
    if (args.middleName !== undefined) patch.middleName = args.middleName;
    if (args.phoneNumber !== undefined) patch.phoneNumber = args.phoneNumber;

    await ctx.db.patch(user._id, patch);
    return { success: true };
  },
});

// Internal helpers
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

export const patchPassword = internalMutation({
  args: {
    userId: v.id("users"),
    passwordHash: v.string(),
    salt: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.userId, {
      passwordHash: args.passwordHash,
      salt: args.salt,
    });
  },
});
