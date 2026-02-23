import { v } from "convex/values";
import { query, mutation } from "../_generated/server";
import { requireCurrentUser, requireRole } from "../lib/auth";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const items = await ctx.db.query("productTypes").collect();
    return items.sort((a, b) => {
      if (a.sortOrder !== undefined && b.sortOrder !== undefined)
        return a.sortOrder - b.sortOrder;
      if (a.sortOrder !== undefined) return -1;
      if (b.sortOrder !== undefined) return 1;
      return a.label.localeCompare(b.label);
    });
  },
});

export const create = mutation({
  args: {
    label: v.string(),
    value: v.string(),
    sortOrder: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const user = await requireCurrentUser(ctx);
    requireRole(user, ["ADMIN"]);

    const existing = await ctx.db
      .query("productTypes")
      .withIndex("by_value", (q) => q.eq("value", args.value))
      .first();

    if (existing) {
      throw new Error("Un type avec cette valeur existe déjà");
    }

    const id = await ctx.db.insert("productTypes", {
      label: args.label,
      value: args.value,
      sortOrder: args.sortOrder,
    });

    return { _id: id };
  },
});

export const update = mutation({
  args: {
    id: v.id("productTypes"),
    label: v.optional(v.string()),
    value: v.optional(v.string()),
    sortOrder: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const user = await requireCurrentUser(ctx);
    requireRole(user, ["ADMIN"]);

    const current = await ctx.db.get(args.id);
    if (!current) throw new Error("Type non trouvé");

    const newValue = args.value;
    if (newValue && newValue !== current.value) {
      const existing = await ctx.db
        .query("productTypes")
        .withIndex("by_value", (q) => q.eq("value", newValue))
        .first();

      if (existing) {
        throw new Error("Un type avec cette valeur existe déjà");
      }

      // Cascade: update products that reference the old value
      const products = await ctx.db.query("products").collect();
      for (const product of products) {
        if (product.type === current.value) {
          const nameParts = product.name.split("|");
          nameParts[0] = newValue;
          await ctx.db.patch(product._id, {
            type: newValue,
            name: nameParts.join("|"),
          });
        }
      }
    }

    const { id, ...rest } = args;
    const patch: Record<string, any> = {};
    for (const [key, value] of Object.entries(rest)) {
      if (value !== undefined) patch[key] = value;
    }

    await ctx.db.patch(id, patch);
    return { success: true };
  },
});

export const remove = mutation({
  args: { id: v.id("productTypes") },
  handler: async (ctx, args) => {
    const user = await requireCurrentUser(ctx);
    requireRole(user, ["ADMIN"]);

    const current = await ctx.db.get(args.id);
    if (!current) throw new Error("Type non trouvé");

    const products = await ctx.db
      .query("products")
      .withIndex("by_type", (q) => q.eq("type", current.value))
      .collect();

    if (products.length > 0) {
      throw new Error(
        `Impossible de supprimer: ${products.length} produit(s) utilisent ce type`
      );
    }

    await ctx.db.delete(args.id);
    return { success: true };
  },
});
