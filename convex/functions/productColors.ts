import { v } from "convex/values";
import { query, mutation } from "../_generated/server";
import { requireCurrentUser, requireRole } from "../lib/auth";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const items = await ctx.db.query("productColors").collect();
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
      .query("productColors")
      .withIndex("by_value", (q) => q.eq("value", args.value))
      .first();

    if (existing) {
      throw new Error("Une couleur avec cette valeur existe déjà");
    }

    const id = await ctx.db.insert("productColors", {
      label: args.label,
      value: args.value,
      sortOrder: args.sortOrder,
    });

    return { _id: id };
  },
});

export const update = mutation({
  args: {
    id: v.id("productColors"),
    label: v.optional(v.string()),
    value: v.optional(v.string()),
    sortOrder: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const user = await requireCurrentUser(ctx);
    requireRole(user, ["ADMIN"]);

    const current = await ctx.db.get(args.id);
    if (!current) throw new Error("Couleur non trouvée");

    const newValue = args.value;
    if (newValue && newValue !== current.value) {
      const existing = await ctx.db
        .query("productColors")
        .withIndex("by_value", (q) => q.eq("value", newValue))
        .first();

      if (existing) {
        throw new Error("Une couleur avec cette valeur existe déjà");
      }

      // Cascade: update products that reference the old value in color or collarColor
      const products = await ctx.db.query("products").collect();
      for (const product of products) {
        // Skip code-based products (they don't use color in their name)
        if (product.code) continue;

        const updates: Record<string, any> = {};
        let nameChanged = false;
        const nameParts = product.name.split("|");

        if (product.color === current.value) {
          updates.color = newValue;
          nameParts[2] = newValue;
          nameChanged = true;
        }

        if (product.collarColor === current.value) {
          updates.collarColor = newValue;
          // collarColor is the 5th part (index 4) if present
          if (nameParts.length >= 5) {
            nameParts[4] = newValue;
            nameChanged = true;
          }
        }

        if (Object.keys(updates).length > 0) {
          if (nameChanged) {
            updates.name = nameParts.join("|");
          }
          await ctx.db.patch(product._id, updates);
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
  args: { id: v.id("productColors") },
  handler: async (ctx, args) => {
    const user = await requireCurrentUser(ctx);
    requireRole(user, ["ADMIN"]);

    const current = await ctx.db.get(args.id);
    if (!current) throw new Error("Couleur non trouvée");

    const products = await ctx.db.query("products").collect();
    const inUse = products.filter(
      (p) => p.color === current.value || p.collarColor === current.value
    );

    if (inUse.length > 0) {
      throw new Error(
        `Impossible de supprimer: ${inUse.length} produit(s) utilisent cette couleur`
      );
    }

    await ctx.db.delete(args.id);
    return { success: true };
  },
});
