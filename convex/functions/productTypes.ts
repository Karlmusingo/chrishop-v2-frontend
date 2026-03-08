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
      return a.value.localeCompare(b.value);
    });
  },
});

export const create = mutation({
  args: {
    value: v.string(),
    sortOrder: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const user = await requireCurrentUser(ctx);
    requireRole(user, ["ADMIN"]);

    const normalizedValue = args.value.trim();
    if (!normalizedValue) {
      throw new Error("La valeur ne peut pas être vide");
    }

    const allItems = await ctx.db.query("productTypes").collect();
    const duplicate = allItems.find(
      (item) => item.value.toLowerCase() === normalizedValue.toLowerCase()
    );

    if (duplicate) {
      throw new Error("Un type avec cette valeur existe déjà");
    }

    const id = await ctx.db.insert("productTypes", {
      value: normalizedValue,
      sortOrder: args.sortOrder,
    });

    return { _id: id };
  },
});

export const update = mutation({
  args: {
    id: v.id("productTypes"),
    value: v.optional(v.string()),
    sortOrder: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const user = await requireCurrentUser(ctx);
    requireRole(user, ["ADMIN"]);

    const current = await ctx.db.get(args.id);
    if (!current) throw new Error("Type non trouvé");

    const newValue = args.value?.trim();
    if (newValue && newValue !== current.value) {
      const allItems = await ctx.db.query("productTypes").collect();
      const duplicate = allItems.find(
        (item) =>
          item._id !== args.id &&
          item.value.toLowerCase() === newValue.toLowerCase()
      );

      if (duplicate) {
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
