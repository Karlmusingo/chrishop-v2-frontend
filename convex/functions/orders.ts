import { v } from "convex/values";
import { query, mutation } from "../_generated/server";
import { orderStatusValidator } from "../schema";

export const list = query({
  args: {
    location: v.optional(v.string()),
    status: v.optional(v.string()),
    userLocationId: v.optional(v.id("locations")),
    userRole: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let orders = await ctx.db.query("orders").order("desc").collect();

    if (args.location) {
      orders = orders.filter((o) => o.locationId === args.location);
    }

    if (args.status) {
      orders = orders.filter((o) => o.status === args.status);
    }

    // Non-admin sees only their location
    if (args.userLocationId && args.userRole !== "ADMIN") {
      orders = orders.filter((o) => o.locationId === args.userLocationId);
    }

    const result = await Promise.all(
      orders.map(async (order) => {
        const orderItems = await ctx.db
          .query("orderItems")
          .withIndex("by_orderId", (q) => q.eq("orderId", order._id))
          .collect();

        const itemsWithProduct = await Promise.all(
          orderItems.map(async (item) => {
            const product = await ctx.db.get(item.productId);
            return { ...item, product };
          })
        );

        const location = await ctx.db.get(order.locationId);
        const user = await ctx.db.get(order.userId);
        const seller = user
          ? { firstName: user.firstName, lastName: user.lastName, name: user.name }
          : null;

        return { ...order, orderItems: itemsWithProduct, location, seller };
      })
    );

    return result;
  },
});

export const get = query({
  args: { id: v.id("orders") },
  handler: async (ctx, args) => {
    const order = await ctx.db.get(args.id);
    if (!order) return null;

    const orderItems = await ctx.db
      .query("orderItems")
      .withIndex("by_orderId", (q) => q.eq("orderId", args.id))
      .collect();

    const itemsWithProduct = await Promise.all(
      orderItems.map(async (item) => {
        const product = await ctx.db.get(item.productId);
        return { ...item, product };
      })
    );

    const location = await ctx.db.get(order.locationId);
    const user = await ctx.db.get(order.userId);
    const seller = user
      ? { firstName: user.firstName, lastName: user.lastName, name: user.name }
      : null;

    return { ...order, orderItems: itemsWithProduct, location, seller };
  },
});

export const create = mutation({
  args: {
    items: v.array(
      v.object({
        productId: v.id("products"),
        quantity: v.number(),
      })
    ),
    userId: v.id("users"),
    locationId: v.id("locations"),
  },
  handler: async (ctx, args) => {
    const ordersToInsert = [];

    for (const orderItem of args.items) {
      const inventory = await ctx.db
        .query("inventories")
        .withIndex("by_productId_locationId", (q) =>
          q
            .eq("productId", orderItem.productId)
            .eq("locationId", args.locationId)
        )
        .first();

      if (!inventory || inventory.quantity < orderItem.quantity) {
        throw new Error(
          "There is no inventory available for this product"
        );
      }

      // Deduct inventory
      await ctx.db.patch(inventory._id, {
        quantity: inventory.quantity - orderItem.quantity,
        expectedRevenue:
          (inventory.expectedRevenue || 0) -
          inventory.price * orderItem.quantity,
      });

      ordersToInsert.push({
        locationId: args.locationId,
        productId: orderItem.productId,
        quantity: orderItem.quantity,
        unitPrice: inventory.price,
        totalPrice: inventory.price * orderItem.quantity,
        userId: args.userId,
      });
    }

    const totalAmount = ordersToInsert.reduce(
      (acc, cur) => acc + cur.totalPrice,
      0
    );

    const orderId = await ctx.db.insert("orders", {
      locationId: args.locationId,
      userId: args.userId,
      totalAmount,
      status: "PENDING",
    });

    for (const item of ordersToInsert) {
      await ctx.db.insert("orderItems", {
        ...item,
        orderId,
      });
    }

    return { orderId, message: "Vente ajoutée avec succès" };
  },
});

export const update = mutation({
  args: {
    id: v.id("orders"),
    items: v.array(
      v.object({
        productId: v.id("products"),
        quantity: v.number(),
      })
    ),
    userId: v.id("users"),
    locationId: v.id("locations"),
  },
  handler: async (ctx, args) => {
    const order = await ctx.db.get(args.id);
    if (!order) throw new Error("Order not found");
    if (order.status !== "PENDING") {
      throw new Error("Order cannot be updated");
    }

    // Release old inventory
    const oldItems = await ctx.db
      .query("orderItems")
      .withIndex("by_orderId", (q) => q.eq("orderId", args.id))
      .collect();

    for (const oldItem of oldItems) {
      const inventory = await ctx.db
        .query("inventories")
        .withIndex("by_productId_locationId", (q) =>
          q
            .eq("productId", oldItem.productId)
            .eq("locationId", oldItem.locationId)
        )
        .first();

      if (inventory) {
        await ctx.db.patch(inventory._id, {
          quantity: inventory.quantity + oldItem.quantity,
          expectedRevenue:
            (inventory.expectedRevenue || 0) +
            oldItem.unitPrice * oldItem.quantity,
        });
      }
    }

    // Delete old order items
    for (const oldItem of oldItems) {
      await ctx.db.delete(oldItem._id);
    }

    // Create new items and deduct inventory
    const newItems = [];
    for (const orderItem of args.items) {
      const inventory = await ctx.db
        .query("inventories")
        .withIndex("by_productId_locationId", (q) =>
          q
            .eq("productId", orderItem.productId)
            .eq("locationId", args.locationId)
        )
        .first();

      if (!inventory || inventory.quantity < orderItem.quantity) {
        throw new Error(
          "There is no inventory available for this product"
        );
      }

      await ctx.db.patch(inventory._id, {
        quantity: inventory.quantity - orderItem.quantity,
        expectedRevenue:
          (inventory.expectedRevenue || 0) -
          inventory.price * orderItem.quantity,
      });

      newItems.push({
        locationId: args.locationId,
        productId: orderItem.productId,
        quantity: orderItem.quantity,
        unitPrice: inventory.price,
        totalPrice: inventory.price * orderItem.quantity,
        userId: args.userId,
      });
    }

    const totalAmount = newItems.reduce(
      (acc, cur) => acc + cur.totalPrice,
      0
    );

    await ctx.db.patch(args.id, {
      totalAmount,
      locationId: args.locationId,
      userId: args.userId,
    });

    for (const item of newItems) {
      await ctx.db.insert("orderItems", {
        ...item,
        orderId: args.id,
      });
    }

    return { orderId: args.id, message: "Vente modifiée avec succès" };
  },
});

export const cancel = mutation({
  args: { id: v.id("orders") },
  handler: async (ctx, args) => {
    const order = await ctx.db.get(args.id);
    if (!order) throw new Error("Order not found");
    if (order.status !== "PENDING") {
      throw new Error("Seules les commandes en attente peuvent être annulées");
    }

    const orderItems = await ctx.db
      .query("orderItems")
      .withIndex("by_orderId", (q) => q.eq("orderId", args.id))
      .collect();

    for (const item of orderItems) {
      const inventory = await ctx.db
        .query("inventories")
        .withIndex("by_productId_locationId", (q) =>
          q
            .eq("productId", item.productId)
            .eq("locationId", item.locationId)
        )
        .first();

      if (inventory) {
        await ctx.db.patch(inventory._id, {
          quantity: inventory.quantity + item.quantity,
          expectedRevenue:
            (inventory.expectedRevenue || 0) +
            item.unitPrice * item.quantity,
        });
      }
    }

    await ctx.db.patch(args.id, { status: "CANCEL" });
    return { success: true, message: "Commande annulée avec succès" };
  },
});

export const buy = mutation({
  args: {
    id: v.id("orders"),
    status: orderStatusValidator,
  },
  handler: async (ctx, args) => {
    const order = await ctx.db.get(args.id);
    if (!order) throw new Error("Order not found");
    if (order.status !== "PENDING") {
      throw new Error("Order cannot be updated");
    }

    await ctx.db.patch(args.id, { status: args.status });
    return { success: true };
  },
});
