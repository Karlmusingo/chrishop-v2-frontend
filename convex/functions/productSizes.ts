import { v } from "convex/values";
import { query, mutation } from "../_generated/server";
import { requireCurrentUser, requireRole } from "../lib/auth";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const items = await ctx.db.query("productSizes").collect();
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
      .query("productSizes")
      .withIndex("by_value", (q) => q.eq("value", args.value))
      .first();

    if (existing) {
      throw new Error("Une taille avec cette valeur existe déjà");
    }

    const id = await ctx.db.insert("productSizes", {
      label: args.label,
      value: args.value,
      sortOrder: args.sortOrder,
    });

    return { _id: id };
  },
});

export const update = mutation({
  args: {
    id: v.id("productSizes"),
    label: v.optional(v.string()),
    value: v.optional(v.string()),
    sortOrder: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const user = await requireCurrentUser(ctx);
    requireRole(user, ["ADMIN"]);

    const current = await ctx.db.get(args.id);
    if (!current) throw new Error("Taille non trouvée");

    const newValue = args.value;
    if (newValue && newValue !== current.value) {
      const existing = await ctx.db
        .query("productSizes")
        .withIndex("by_value", (q) => q.eq("value", newValue))
        .first();

      if (existing) {
        throw new Error("Une taille avec cette valeur existe déjà");
      }

      // Cascade: update products that reference the old value
      const products = await ctx.db.query("products").collect();
      for (const product of products) {
        // Skip code-based products (they don't use size in their name)
        if (product.code) continue;

        if (product.size === current.value) {
          const nameParts = product.name.split("|");
          nameParts[3] = newValue;
          await ctx.db.patch(product._id, {
            size: newValue,
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
  args: { id: v.id("productSizes") },
  handler: async (ctx, args) => {
    const user = await requireCurrentUser(ctx);
    requireRole(user, ["ADMIN"]);

    const current = await ctx.db.get(args.id);
    if (!current) throw new Error("Taille non trouvée");

    const products = await ctx.db.query("products").collect();
    const inUse = products.filter((p) => p.size === current.value);

    if (inUse.length > 0) {
      throw new Error(
        `Impossible de supprimer: ${inUse.length} produit(s) utilisent cette taille`
      );
    }

    await ctx.db.delete(args.id);
    return { success: true };
  },
});
