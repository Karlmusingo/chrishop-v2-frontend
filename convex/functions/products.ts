import { v } from "convex/values";
import { query, mutation } from "../_generated/server";

export const list = query({
  args: {
    search: v.optional(v.string()),
    type: v.optional(v.string()),
    brand: v.optional(v.string()),
    color: v.optional(v.string()),
    size: v.optional(v.string()),
    collarColor: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let products = await ctx.db.query("products").collect();

    if (args.search) {
      const search = args.search.toLowerCase();
      products = products.filter((p) =>
        p.name.toLowerCase().includes(search)
      );
    }
    if (args.type) {
      products = products.filter((p) => p.type === args.type);
    }
    if (args.brand) {
      products = products.filter((p) => p.brand === args.brand);
    }
    if (args.color) {
      products = products.filter((p) => p.color === args.color);
    }
    if (args.size) {
      products = products.filter((p) => p.size === args.size);
    }
    if (args.collarColor) {
      products = products.filter((p) => p.collarColor === args.collarColor);
    }

    return products;
  },
});

export const get = query({
  args: { id: v.id("products") },
  handler: async (ctx, args) => {
    const product = await ctx.db.get(args.id);
    if (!product) return null;

    const inventories = await ctx.db
      .query("inventories")
      .withIndex("by_productId", (q) => q.eq("productId", args.id))
      .collect();

    return { ...product, inventories };
  },
});

export const create = mutation({
  args: {
    type: v.string(),
    brand: v.string(),
    color: v.array(v.string()),
    size: v.array(v.string()),
    collarColor: v.optional(v.array(v.string())),
    price: v.optional(v.number()),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    type InsertProduct = {
      name: string;
      type: string;
      brand: string;
      color: string;
      size: string;
      price?: number;
      collarColor?: string;
      description?: string;
    };

    const insertProducts = args.color.reduce<InsertProduct[]>(
      (result, color) => {
        const sizes: InsertProduct[] = args.size.map((size) => {
          const name = `${args.type}|${args.brand}|${color}|${size}`;
          return {
            name,
            type: args.type,
            brand: args.brand,
            color,
            size,
            price: args.price,
            description: args.description,
          };
        });

        const finalInput =
          args.collarColor && args.collarColor.length > 0
            ? sizes.reduce<InsertProduct[]>((acc, sizeItem) => {
                const collarVariants = (args.collarColor ?? []).map(
                  (collar) => {
                    const name = `${sizeItem.name}|${collar}`;
                    return { ...sizeItem, name, collarColor: collar };
                  }
                );
                return [...acc, ...collarVariants];
              }, [])
            : sizes;

        return [...result, ...finalInput];
      },
      []
    );

    const ids = [];
    for (const product of insertProducts) {
      const id = await ctx.db.insert("products", product);
      ids.push(id);
    }

    return { count: ids.length };
  },
});

export const update = mutation({
  args: {
    id: v.id("products"),
    type: v.optional(v.string()),
    brand: v.optional(v.string()),
    color: v.optional(v.string()),
    size: v.optional(v.string()),
    collarColor: v.optional(v.string()),
    price: v.optional(v.number()),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...rest } = args;
    const name = `${rest.type}|${rest.brand}|${rest.color}|${rest.size}`;

    const patch: Record<string, any> = { name };
    for (const [key, value] of Object.entries(rest)) {
      if (value !== undefined) patch[key] = value;
    }

    await ctx.db.patch(id, patch);
    return { success: true };
  },
});
