import { v } from "convex/values";
import { query } from "../_generated/server";

export const getData = query({
  args: {
    location: v.optional(v.string()),
    userLocationId: v.optional(v.id("locations")),
    userRole: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const locationId =
      args.location ||
      (args.userRole !== "ADMIN" ? args.userLocationId : undefined);

    // Get date range for this week
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(startOfWeek.getDate() - (startOfWeek.getDay() + 1));
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(endOfWeek.getDate() + 7);

    // Get all order items (with location filter)
    let orderItems = await ctx.db.query("orderItems").collect();
    if (locationId) {
      orderItems = orderItems.filter(
        (item) => item.locationId === locationId
      );
    }

    // Get all orders (with location filter)
    let orders = await ctx.db.query("orders").collect();
    if (locationId) {
      orders = orders.filter((o) => o.locationId === locationId);
    }

    // Week items
    const startTs = startOfWeek.getTime();
    const endTs = endOfWeek.getTime();
    const weekItems = orderItems.filter(
      (item) =>
        item._creationTime >= startTs && item._creationTime <= endTs
    );
    const weekOrders = orders.filter(
      (o) => o._creationTime >= startTs && o._creationTime <= endTs
    );

    // Daily sales
    const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const dailySales = daysOfWeek.map((day, index) => {
      const daySales = weekItems
        .filter((item) => new Date(item._creationTime).getDay() === index)
        .reduce((sum, item) => sum + item.totalPrice, 0);
      return { day, sales: daySales };
    });

    // Sales by type
    const typeMap = new Map<string, number>();
    for (const item of weekItems) {
      const product = await ctx.db.get(item.productId);
      const type = product?.type || "Unknown";
      typeMap.set(type, (typeMap.get(type) || 0) + item.totalPrice);
    }
    const salesByType = Array.from(typeMap.entries())
      .map(([type, totalSales]) => ({ type, totalsales: totalSales }))
      .sort((a, b) => b.totalsales - a.totalsales);

    // Sales by brand
    const brandMap = new Map<string, number>();
    for (const item of weekItems) {
      const product = await ctx.db.get(item.productId);
      const brand = product?.brand || "Unknown";
      brandMap.set(brand, (brandMap.get(brand) || 0) + item.totalPrice);
    }
    const salesByBrand = Array.from(brandMap.entries())
      .map(([brand, totalSales]) => ({ brand, totalsales: totalSales }))
      .sort((a, b) => b.totalsales - a.totalsales);

    // Sales summary
    const totalSalesValue = weekItems.reduce(
      (sum, item) => sum + item.totalPrice,
      0
    );
    const totalOrdersCount = weekOrders.length;
    const totalItemsSold = weekItems.reduce(
      (sum, item) => sum + item.quantity,
      0
    );
    const totalVisitors = 1000;

    const salesSummary = [
      {
        category: "Total Sales",
        value: `$${totalSalesValue.toFixed(2)}`,
      },
      {
        category: "Average Order Value",
        value: `$${(totalSalesValue / (totalOrdersCount || 1)).toFixed(2)}`,
      },
      {
        category: "Items Sold",
        value: totalItemsSold.toString(),
      },
      {
        category: "Conversion Rate",
        value: `${((totalOrdersCount / totalVisitors) * 100).toFixed(1)}%`,
      },
    ];

    // Low stock items
    let inventories = await ctx.db.query("inventories").collect();
    if (locationId) {
      inventories = inventories.filter(
        (inv) => inv.locationId === locationId
      );
    }
    const lowStockRaw = inventories
      .filter((inv) => inv.quantity >= 1 && inv.quantity < 25)
      .slice(0, 10);

    const lowStockItems = await Promise.all(
      lowStockRaw.map(async (inv) => {
        const product = await ctx.db.get(inv.productId);
        const location = inv.locationId
          ? await ctx.db.get(inv.locationId)
          : null;
        return { ...inv, product, location, status: "LOW_STOCK" };
      })
    );

    return {
      dailySales,
      salesByType,
      salesByBrand,
      salesSummary,
      lowStockItems,
    };
  },
});
