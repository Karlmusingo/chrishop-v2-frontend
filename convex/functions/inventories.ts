import { v } from "convex/values";
import { query, mutation } from "../_generated/server";

function computeStatus(quantity: number): string {
  if (quantity <= 0) return "OUT_OF_STOCK";
  if (quantity < 25) return "LOW_STOCK";
  return "IN_STOCK";
}

export const list = query({
  args: {
    search: v.optional(v.string()),
    type: v.optional(v.string()),
    brand: v.optional(v.string()),
    color: v.optional(v.string()),
    size: v.optional(v.string()),
    collarColor: v.optional(v.string()),
    location: v.optional(v.string()),
    status: v.optional(v.string()),
    userLocationId: v.optional(v.id("locations")),
    userRole: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let inventories = await ctx.db.query("inventories").collect();

    // Location filtering
    if (args.location === "depot") {
      inventories = inventories.filter((inv) => !inv.locationId);
    } else if (args.location) {
      inventories = inventories.filter(
        (inv) => inv.locationId === args.location
      );
    }

    // Non-admin sees only their location
    if (args.userLocationId && args.userRole !== "ADMIN") {
      inventories = inventories.filter(
        (inv) => inv.locationId === args.userLocationId
      );
    }

    // Status filtering (computed)
    if (args.status) {
      if (args.status === "IN_STOCK") {
        inventories = inventories.filter((inv) => inv.quantity >= 25);
      } else if (args.status === "LOW_STOCK") {
        inventories = inventories.filter(
          (inv) => inv.quantity >= 1 && inv.quantity < 25
        );
      } else if (args.status === "OUT_OF_STOCK") {
        inventories = inventories.filter((inv) => inv.quantity <= 0);
      }
    }

    // Join with products and locations, apply product filters
    const result = await Promise.all(
      inventories.map(async (inv) => {
        const product = await ctx.db.get(inv.productId);
        const location = inv.locationId
          ? await ctx.db.get(inv.locationId)
          : null;
        return {
          ...inv,
          product,
          location,
          status: computeStatus(inv.quantity),
        };
      })
    );

    let filtered = result;

    if (args.search) {
      const search = args.search.toLowerCase();
      filtered = filtered.filter((inv) =>
        inv.product?.name?.toLowerCase().includes(search)
      );
    }
    if (args.type) {
      filtered = filtered.filter((inv) => inv.product?.type === args.type);
    }
    if (args.brand) {
      filtered = filtered.filter((inv) => inv.product?.brand === args.brand);
    }
    if (args.color) {
      filtered = filtered.filter((inv) => inv.product?.color === args.color);
    }
    if (args.size) {
      filtered = filtered.filter((inv) => inv.product?.size === args.size);
    }
    if (args.collarColor) {
      filtered = filtered.filter(
        (inv) => inv.product?.collarColor === args.collarColor
      );
    }

    return filtered;
  },
});

export const findByProductAttributes = query({
  args: {
    type: v.string(),
    brand: v.string(),
    code: v.optional(v.string()),
    color: v.optional(v.string()),
    size: v.optional(v.string()),
    collarColor: v.optional(v.string()),
    locationId: v.id("locations"),
  },
  handler: async (ctx, args) => {
    let name: string;
    if (args.code) {
      name = `${args.type}|${args.brand}|${args.code}`;
    } else {
      const nameParts = [args.type, args.brand, args.color!, args.size!];
      if (args.collarColor) {
        nameParts.push(args.collarColor);
      }
      name = nameParts.join("|");
    }

    const product = await ctx.db
      .query("products")
      .withIndex("by_name", (q) => q.eq("name", name))
      .first();

    if (!product) return null;

    const inventory = await ctx.db
      .query("inventories")
      .withIndex("by_productId_locationId", (q) =>
        q.eq("productId", product._id).eq("locationId", args.locationId)
      )
      .first();

    if (!inventory) return null;

    return {
      ...inventory,
      product,
      status: computeStatus(inventory.quantity),
    };
  },
});

export const get = query({
  args: { id: v.id("inventories") },
  handler: async (ctx, args) => {
    const inv = await ctx.db.get(args.id);
    if (!inv) return null;

    const product = await ctx.db.get(inv.productId);
    const location = inv.locationId ? await ctx.db.get(inv.locationId) : null;

    return {
      ...inv,
      product,
      location,
      status: computeStatus(inv.quantity),
    };
  },
});

export const create = mutation({
  args: {
    items: v.array(
      v.object({
        productId: v.id("products"),
        quantity: v.number(),
        price: v.number(),
        location: v.optional(v.id("locations")),
      })
    ),
  },
  handler: async (ctx, args) => {
    for (const item of args.items) {
      if (item.quantity <= 0) {
        throw new Error("Quantité invalide");
      }

      const product = await ctx.db.get(item.productId);
      if (!product) {
        throw new Error("ProductId n'est pas trouve");
      }

      const existing = await ctx.db
        .query("inventories")
        .withIndex("by_productId_locationId", (q) =>
          q.eq("productId", item.productId).eq("locationId", item.location)
        )
        .first();

      if (existing) {
        await ctx.db.patch(existing._id, {
          price: item.price,
          quantity: existing.quantity + item.quantity,
          expectedRevenue:
            (existing.expectedRevenue || 0) + item.price * item.quantity,
        });
      } else {
        await ctx.db.insert("inventories", {
          productName: product.name,
          productId: item.productId,
          locationId: item.location,
          price: item.price,
          quantity: item.quantity,
          expectedRevenue: item.price * item.quantity,
        });
      }
    }

    return { success: true };
  },
});

export const update = mutation({
  args: {
    id: v.id("inventories"),
    quantity: v.number(),
    price: v.number(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      quantity: args.quantity,
      price: args.price,
      expectedRevenue: args.price * args.quantity,
    });
    return { success: true };
  },
});

export const add = mutation({
  args: {
    id: v.id("inventories"),
    quantity: v.number(),
  },
  handler: async (ctx, args) => {
    const inventory = await ctx.db.get(args.id);
    if (!inventory) throw new Error("Inventory not found");

    await ctx.db.patch(args.id, {
      quantity: inventory.quantity + args.quantity,
      expectedRevenue:
        (inventory.expectedRevenue || 0) + inventory.price * args.quantity,
    });
    return { success: true };
  },
});

export const transfer = mutation({
  args: {
    id: v.id("inventories"),
    location: v.id("locations"),
    quantity: v.number(),
  },
  handler: async (ctx, args) => {
    const inventory = await ctx.db.get(args.id);
    if (!inventory) throw new Error("Inventory not found");
    if (inventory.quantity < args.quantity) {
      throw new Error("Quantity is not enough");
    }

    // Find target inventory (same product, target location)
    const towardInventory = await ctx.db
      .query("inventories")
      .withIndex("by_productId_locationId", (q) =>
        q
          .eq("productId", inventory.productId)
          .eq("locationId", args.location)
      )
      .first();

    if (!towardInventory) {
      await ctx.db.insert("inventories", {
        productName: inventory.productName,
        productId: inventory.productId,
        locationId: args.location,
        price: inventory.price,
        quantity: args.quantity,
        expectedRevenue: inventory.price * args.quantity,
      });
    } else {
      await ctx.db.patch(towardInventory._id, {
        quantity: towardInventory.quantity + args.quantity,
        expectedRevenue:
          (towardInventory.expectedRevenue || 0) +
          inventory.price * args.quantity,
      });
    }

    // Deduct from source
    await ctx.db.patch(args.id, {
      quantity: inventory.quantity - args.quantity,
      expectedRevenue:
        (inventory.expectedRevenue || 0) - inventory.price * args.quantity,
    });

    return { success: true };
  },
});

export const findByProductAttributesAtSource = query({
  args: {
    type: v.string(),
    brand: v.string(),
    code: v.optional(v.string()),
    color: v.optional(v.string()),
    size: v.optional(v.string()),
    collarColor: v.optional(v.string()),
    locationId: v.optional(v.id("locations")),
  },
  handler: async (ctx, args) => {
    let name: string;
    if (args.code) {
      name = `${args.type}|${args.brand}|${args.code}`;
    } else {
      const nameParts = [args.type, args.brand, args.color!, args.size!];
      if (args.collarColor) {
        nameParts.push(args.collarColor);
      }
      name = nameParts.join("|");
    }

    const product = await ctx.db
      .query("products")
      .withIndex("by_name", (q) => q.eq("name", name))
      .first();

    if (!product) return null;

    const inventory = await ctx.db
      .query("inventories")
      .withIndex("by_productId_locationId", (q) =>
        q.eq("productId", product._id).eq("locationId", args.locationId)
      )
      .first();

    if (!inventory) return null;

    return {
      ...inventory,
      product,
      status: computeStatus(inventory.quantity),
    };
  },
});

export const bulkTransfer = mutation({
  args: {
    items: v.array(
      v.object({
        productId: v.id("products"),
        quantity: v.number(),
      })
    ),
    sourceLocationId: v.optional(v.id("locations")),
    destinationLocationId: v.id("locations"),
  },
  handler: async (ctx, args) => {
    if (args.sourceLocationId === args.destinationLocationId) {
      throw new Error(
        "La source et la destination ne peuvent pas être identiques"
      );
    }

    if (args.items.length === 0) {
      throw new Error("Veuillez ajouter au moins un article");
    }

    for (const item of args.items) {
      if (item.quantity <= 0) {
        throw new Error("La quantité doit être supérieure à 0");
      }

      const sourceInventory = await ctx.db
        .query("inventories")
        .withIndex("by_productId_locationId", (q) =>
          q
            .eq("productId", item.productId)
            .eq("locationId", args.sourceLocationId)
        )
        .first();

      if (!sourceInventory) {
        const product = await ctx.db.get(item.productId);
        throw new Error(
          `Produit "${product?.name ?? item.productId}" introuvable à cette source`
        );
      }

      if (sourceInventory.quantity < item.quantity) {
        const product = await ctx.db.get(item.productId);
        throw new Error(
          `Stock insuffisant pour "${product?.name}": ${sourceInventory.quantity} disponible(s), ${item.quantity} demandé(s)`
        );
      }

      // Find or create destination inventory
      const destInventory = await ctx.db
        .query("inventories")
        .withIndex("by_productId_locationId", (q) =>
          q
            .eq("productId", item.productId)
            .eq("locationId", args.destinationLocationId)
        )
        .first();

      if (!destInventory) {
        await ctx.db.insert("inventories", {
          productName: sourceInventory.productName,
          productId: item.productId,
          locationId: args.destinationLocationId,
          price: sourceInventory.price,
          quantity: item.quantity,
          expectedRevenue: sourceInventory.price * item.quantity,
        });
      } else {
        await ctx.db.patch(destInventory._id, {
          quantity: destInventory.quantity + item.quantity,
          expectedRevenue:
            (destInventory.expectedRevenue || 0) +
            sourceInventory.price * item.quantity,
        });
      }

      // Deduct from source
      await ctx.db.patch(sourceInventory._id, {
        quantity: sourceInventory.quantity - item.quantity,
        expectedRevenue:
          (sourceInventory.expectedRevenue || 0) -
          sourceInventory.price * item.quantity,
      });
    }

    return { success: true };
  },
});
