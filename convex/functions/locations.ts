import { v } from "convex/values";
import { query, mutation } from "../_generated/server";
import { locationStatusValidator } from "../schema";

export const list = query({
  args: {
    search: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let locations = await ctx.db.query("locations").collect();

    if (args.search) {
      const search = args.search.toLowerCase();
      locations = locations.filter((l) =>
        l.name.toLowerCase().includes(search)
      );
    }

    return locations;
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    province: v.optional(v.string()),
    city: v.optional(v.string()),
    address: v.optional(v.string()),
    contactEmail: v.optional(v.string()),
    contactPhoneNumber: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("locations")
      .withIndex("by_name", (q) => q.eq("name", args.name))
      .first();

    if (existing) {
      throw new Error("Location already created");
    }

    const id = await ctx.db.insert("locations", {
      ...args,
      status: "ACTIVE" as const,
    });

    return { _id: id };
  },
});

export const update = mutation({
  args: {
    id: v.id("locations"),
    name: v.optional(v.string()),
    province: v.optional(v.string()),
    city: v.optional(v.string()),
    address: v.optional(v.string()),
    contactEmail: v.optional(v.string()),
    contactPhoneNumber: v.optional(v.string()),
    status: v.optional(locationStatusValidator),
  },
  handler: async (ctx, args) => {
    const { id, ...rest } = args;

    const patch: Record<string, any> = {};
    for (const [key, value] of Object.entries(rest)) {
      if (value !== undefined) patch[key] = value;
    }

    await ctx.db.patch(id, patch);
    return { success: true };
  },
});
