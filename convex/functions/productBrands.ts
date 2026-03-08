import { v } from "convex/values";
import { query, mutation } from "../_generated/server";
import { requireCurrentUser, requireRole } from "../lib/auth";

export const list = query({
  args: {
    typeId: v.optional(v.id("productTypes")),
  },
  handler: async (ctx, args) => {
    let items;
    if (args.typeId) {
      items = await ctx.db
        .query("productBrands")
        .withIndex("by_typeId", (q) => q.eq("typeId", args.typeId))
        .collect();
    } else {
      items = await ctx.db.query("productBrands").collect();
    }

    // Build type lookup map to avoid N+1
    const typeIds = Array.from(new Set(items.map((i) => i.typeId).filter(Boolean)));
    const typeMap = new Map<string, string>();
    for (const typeId of typeIds) {
      const type = await ctx.db.get(typeId!);
      if (type) typeMap.set(typeId!.toString(), type.value);
    }

    const enriched = items.map((item) => ({
      ...item,
      typeName: item.typeId ? typeMap.get(item.typeId.toString()) ?? "Non défini" : "Non défini",
    }));

    return enriched.sort((a, b) => {
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
    typeId: v.id("productTypes"),
  },
  handler: async (ctx, args) => {
    const user = await requireCurrentUser(ctx);
    requireRole(user, ["ADMIN"]);

    const normalizedValue = args.value.trim();
    if (!normalizedValue) {
      throw new Error("La valeur ne peut pas être vide");
    }

    // Validate type exists
    const type = await ctx.db.get(args.typeId);
    if (!type) throw new Error("Type non trouvé");

    // Scope uniqueness check to same typeId
    const brandsOfType = await ctx.db
      .query("productBrands")
      .withIndex("by_typeId", (q) => q.eq("typeId", args.typeId))
      .collect();

    const duplicate = brandsOfType.find(
      (item) => item.value.toLowerCase() === normalizedValue.toLowerCase()
    );

    if (duplicate) {
      throw new Error("Une marque avec cette valeur existe déjà pour ce type");
    }

    const id = await ctx.db.insert("productBrands", {
      value: normalizedValue,
      sortOrder: args.sortOrder,
      typeId: args.typeId,
    });

    return { _id: id };
  },
});

export const update = mutation({
  args: {
    id: v.id("productBrands"),
    value: v.optional(v.string()),
    sortOrder: v.optional(v.number()),
    typeId: v.optional(v.id("productTypes")),
  },
  handler: async (ctx, args) => {
    const user = await requireCurrentUser(ctx);
    requireRole(user, ["ADMIN"]);

    const current = await ctx.db.get(args.id);
    if (!current) throw new Error("Marque non trouvée");

    // Validate typeId if provided
    if (args.typeId) {
      const type = await ctx.db.get(args.typeId);
      if (!type) throw new Error("Type non trouvé");
    }

    const newValue = args.value?.trim();
    const targetTypeId = args.typeId ?? current.typeId;

    if (newValue && (newValue !== current.value || args.typeId !== undefined)) {
      // Scope uniqueness to target typeId
      const brandsOfType = targetTypeId
        ? await ctx.db
            .query("productBrands")
            .withIndex("by_typeId", (q) => q.eq("typeId", targetTypeId))
            .collect()
        : await ctx.db.query("productBrands").collect();

      const duplicate = brandsOfType.find(
        (item) =>
          item._id !== args.id &&
          item.value.toLowerCase() === newValue.toLowerCase()
      );

      if (duplicate) {
        throw new Error("Une marque avec cette valeur existe déjà pour ce type");
      }

      // Cascade: update products that reference the old value
      if (newValue !== current.value) {
        const products = await ctx.db
          .query("products")
          .withIndex("by_brand", (q) => q.eq("brand", current.value))
          .collect();

        for (const product of products) {
          const nameParts = product.name.split("|");
          nameParts[1] = newValue;
          await ctx.db.patch(product._id, {
            brand: newValue,
            name: nameParts.join("|"),
          });
        }
      }
    }

    const patch: Record<string, any> = {};
    if (newValue !== undefined) patch.value = newValue;
    if (args.sortOrder !== undefined) patch.sortOrder = args.sortOrder;
    if (args.typeId !== undefined) patch.typeId = args.typeId;

    await ctx.db.patch(args.id, patch);
    return { success: true };
  },
});

export const remove = mutation({
  args: { id: v.id("productBrands") },
  handler: async (ctx, args) => {
    const user = await requireCurrentUser(ctx);
    requireRole(user, ["ADMIN"]);

    const current = await ctx.db.get(args.id);
    if (!current) throw new Error("Marque non trouvée");

    const products = await ctx.db
      .query("products")
      .withIndex("by_brand", (q) => q.eq("brand", current.value))
      .collect();

    if (products.length > 0) {
      throw new Error(
        `Impossible de supprimer: ${products.length} produit(s) utilisent cette marque`
      );
    }

    await ctx.db.delete(args.id);
    return { success: true };
  },
});
