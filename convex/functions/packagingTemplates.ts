import { v } from "convex/values";
import { query, mutation } from "../_generated/server";
import { requireCurrentUser, requireRole } from "../lib/auth";

export const list = query({
  args: {
    packagingType: v.optional(
      v.union(v.literal("BALE"), v.literal("DOZEN"))
    ),
  },
  handler: async (ctx, args) => {
    let templates = await ctx.db.query("packagingTemplates").collect();

    if (args.packagingType) {
      templates = templates.filter(
        (t) => t.packagingType === args.packagingType
      );
    }

    return templates.sort((a, b) => a.name.localeCompare(b.name));
  },
});

export const get = query({
  args: { id: v.id("packagingTemplates") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    packagingType: v.union(v.literal("BALE"), v.literal("DOZEN")),
    totalItems: v.number(),
    sizeDistribution: v.array(
      v.object({ size: v.string(), quantity: v.number() })
    ),
  },
  handler: async (ctx, args) => {
    const user = await requireCurrentUser(ctx);
    requireRole(user, ["ADMIN"]);

    // Validate name uniqueness
    const existing = await ctx.db
      .query("packagingTemplates")
      .withIndex("by_name", (q) => q.eq("name", args.name))
      .first();
    if (existing) {
      throw new Error("Un modèle d'emballage avec ce nom existe déjà");
    }

    // Validate sizeDistribution
    if (args.sizeDistribution.length === 0) {
      throw new Error("La distribution des tailles ne peut pas être vide");
    }

    const sizes = args.sizeDistribution.map((s) => s.size);
    if (new Set(sizes).size !== sizes.length) {
      throw new Error("Les tailles ne peuvent pas être dupliquées");
    }

    for (const entry of args.sizeDistribution) {
      if (entry.quantity <= 0) {
        throw new Error("Chaque quantité doit être supérieure à 0");
      }
    }

    const sum = args.sizeDistribution.reduce((acc, s) => acc + s.quantity, 0);
    if (sum !== args.totalItems) {
      throw new Error(
        `La somme des quantités (${sum}) ne correspond pas au total (${args.totalItems})`
      );
    }

    const id = await ctx.db.insert("packagingTemplates", {
      name: args.name,
      packagingType: args.packagingType,
      totalItems: args.totalItems,
      sizeDistribution: args.sizeDistribution,
    });

    return { _id: id };
  },
});

export const update = mutation({
  args: {
    id: v.id("packagingTemplates"),
    name: v.optional(v.string()),
    packagingType: v.optional(
      v.union(v.literal("BALE"), v.literal("DOZEN"))
    ),
    totalItems: v.optional(v.number()),
    sizeDistribution: v.optional(
      v.array(v.object({ size: v.string(), quantity: v.number() }))
    ),
  },
  handler: async (ctx, args) => {
    const user = await requireCurrentUser(ctx);
    requireRole(user, ["ADMIN"]);

    const current = await ctx.db.get(args.id);
    if (!current) throw new Error("Modèle d'emballage non trouvé");

    // Validate name uniqueness if changed
    if (args.name && args.name !== current.name) {
      const existing = await ctx.db
        .query("packagingTemplates")
        .withIndex("by_name", (q) => q.eq("name", args.name!))
        .first();
      if (existing) {
        throw new Error("Un modèle d'emballage avec ce nom existe déjà");
      }
    }

    const sizeDistribution = args.sizeDistribution ?? current.sizeDistribution;
    const totalItems = args.totalItems ?? current.totalItems;

    // Validate sizeDistribution
    if (args.sizeDistribution) {
      if (sizeDistribution.length === 0) {
        throw new Error("La distribution des tailles ne peut pas être vide");
      }

      const sizes = sizeDistribution.map((s) => s.size);
      if (new Set(sizes).size !== sizes.length) {
        throw new Error("Les tailles ne peuvent pas être dupliquées");
      }

      for (const entry of sizeDistribution) {
        if (entry.quantity <= 0) {
          throw new Error("Chaque quantité doit être supérieure à 0");
        }
      }
    }

    const sum = sizeDistribution.reduce((acc, s) => acc + s.quantity, 0);
    if (sum !== totalItems) {
      throw new Error(
        `La somme des quantités (${sum}) ne correspond pas au total (${totalItems})`
      );
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
  args: { id: v.id("packagingTemplates") },
  handler: async (ctx, args) => {
    const user = await requireCurrentUser(ctx);
    requireRole(user, ["ADMIN"]);

    const current = await ctx.db.get(args.id);
    if (!current) throw new Error("Modèle d'emballage non trouvé");

    await ctx.db.delete(args.id);
    return { success: true };
  },
});

export const expandToItems = query({
  args: {
    templateId: v.id("packagingTemplates"),
    numberOfPackages: v.optional(v.number()),
    productType: v.string(),
    productBrand: v.string(),
    color: v.string(),
    collarColor: v.optional(v.string()),
    locationId: v.optional(v.id("locations")),
    checkInventory: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const template = await ctx.db.get(args.templateId);
    if (!template) throw new Error("Modèle d'emballage non trouvé");

    const multiplier = args.numberOfPackages ?? 1;
    const shouldCheckInventory = !!args.locationId || !!args.checkInventory;
    const items: Array<{
      productId: string;
      productName: string;
      size: string;
      quantity: number;
      type: string;
      brand: string;
      color: string;
      collarColor?: string;
      inventoryPrice?: number;
      availableQuantity?: number;
    }> = [];
    const missingProducts: string[] = [];
    const insufficientStock: Array<{
      size: string;
      productName: string;
      required: number;
      available: number;
    }> = [];

    for (const entry of template.sizeDistribution) {
      const nameParts = [
        args.productType,
        args.productBrand,
        args.color,
        entry.size,
      ];
      if (args.collarColor) {
        nameParts.push(args.collarColor);
      }
      const productName = nameParts.join("|");

      const product = await ctx.db
        .query("products")
        .withIndex("by_name", (q) => q.eq("name", productName))
        .first();

      if (!product) {
        missingProducts.push(productName);
        continue;
      }

      const quantity = entry.quantity * multiplier;
      let inventoryPrice: number | undefined;
      let availableQuantity: number | undefined;

      // Check inventory when locationId provided or checkInventory flag set
      if (shouldCheckInventory) {
        const inventory = await ctx.db
          .query("inventories")
          .withIndex("by_productId_locationId", (q) =>
            q
              .eq("productId", product._id)
              .eq("locationId", args.locationId)
          )
          .first();

        if (inventory) {
          inventoryPrice = inventory.price;
          availableQuantity = inventory.quantity;
          if (inventory.quantity < quantity) {
            insufficientStock.push({
              size: entry.size,
              productName,
              required: quantity,
              available: inventory.quantity,
            });
          }
        } else {
          insufficientStock.push({
            size: entry.size,
            productName,
            required: quantity,
            available: 0,
          });
        }
      }

      items.push({
        productId: product._id,
        productName,
        size: entry.size,
        quantity,
        type: args.productType,
        brand: args.productBrand,
        color: args.color,
        ...(args.collarColor
          ? { collarColor: args.collarColor }
          : {}),
        ...(inventoryPrice !== undefined ? { inventoryPrice } : {}),
        ...(availableQuantity !== undefined ? { availableQuantity } : {}),
      });
    }

    return { items, missingProducts, insufficientStock };
  },
});

export const ensureProductsExist = mutation({
  args: {
    productType: v.string(),
    productBrand: v.string(),
    color: v.string(),
    collarColor: v.optional(v.string()),
    sizes: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await requireCurrentUser(ctx);
    requireRole(user, ["ADMIN"]);

    for (const size of args.sizes) {
      const nameParts = [args.productType, args.productBrand, args.color, size];
      if (args.collarColor) {
        nameParts.push(args.collarColor);
      }
      const productName = nameParts.join("|");

      const existingProduct = await ctx.db
        .query("products")
        .withIndex("by_name", (q) => q.eq("name", productName))
        .first();

      if (!existingProduct) {
        await ctx.db.insert("products", {
          name: productName,
          type: args.productType,
          brand: args.productBrand,
          color: args.color,
          size,
          ...(args.collarColor ? { collarColor: args.collarColor } : {}),
        });
      }
    }

    return { success: true };
  },
});
