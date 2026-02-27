import { v } from "convex/values";
import { query, mutation } from "../_generated/server";

export const list = query({
  args: {
    search: v.optional(v.string()),
    type: v.optional(v.string()),
    brand: v.optional(v.string()),
    code: v.optional(v.string()),
    color: v.optional(v.string()),
    size: v.optional(v.string()),
    collarColor: v.optional(v.string()),
    page: v.optional(v.number()),
    perPage: v.optional(v.number()),
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
    if (args.code) {
      products = products.filter((p) => p.code === args.code);
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

    const page = args.page ?? 1;
    const perPage = args.perPage ?? 10;
    const total = products.length;
    const lastPage = Math.max(1, Math.ceil(total / perPage));
    const currentPage = Math.max(1, Math.min(page, lastPage));
    const startIndex = (currentPage - 1) * perPage;
    const data = products.slice(startIndex, startIndex + perPage);

    return {
      data,
      meta: {
        total,
        lastPage,
        currentPage,
        perPage,
        prev: currentPage > 1 ? currentPage - 1 : null,
        next: currentPage < lastPage ? currentPage + 1 : null,
      },
    };
  },
});

export const findByAttributes = query({
  args: {
    type: v.string(),
    brand: v.string(),
    code: v.optional(v.string()),
    color: v.optional(v.string()),
    size: v.optional(v.string()),
    collarColor: v.optional(v.string()),
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

    return await ctx.db
      .query("products")
      .withIndex("by_name", (q) => q.eq("name", name))
      .first();
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
    code: v.optional(v.string()),
    color: v.optional(v.array(v.string())),
    size: v.optional(v.array(v.string())),
    collarColor: v.optional(v.array(v.string())),
    price: v.optional(v.number()),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Code-based product: single product creation
    if (args.code) {
      const name = `${args.type}|${args.brand}|${args.code}`;
      const id = await ctx.db.insert("products", {
        name,
        type: args.type,
        brand: args.brand,
        code: args.code,
        price: args.price,
        description: args.description,
      });
      return { count: 1 };
    }

    // Standard bulk creation: color + size required
    if (!args.color?.length || !args.size?.length) {
      throw new Error("Veuillez fournir un code ou des couleurs et tailles");
    }

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
        const sizes: InsertProduct[] = args.size!.map((size) => {
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
    code: v.optional(v.string()),
    color: v.optional(v.string()),
    size: v.optional(v.string()),
    collarColor: v.optional(v.string()),
    price: v.optional(v.number()),
    description: v.optional(v.string()),
    lowStockThreshold: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { id, lowStockThreshold, ...rest } = args;

    const patch: Record<string, any> = {};

    // Only recompute name if product attribute fields are provided
    const hasNameFields = rest.type || rest.brand || rest.code || rest.color || rest.size;
    if (hasNameFields) {
      let name: string;
      if (rest.code) {
        name = `${rest.type}|${rest.brand}|${rest.code}`;
      } else {
        const nameParts = [rest.type, rest.brand, rest.color, rest.size];
        if (rest.collarColor) {
          nameParts.push(rest.collarColor);
        }
        name = nameParts.filter(Boolean).join("|");
      }
      patch.name = name;
    }

    for (const [key, value] of Object.entries(rest)) {
      if (value !== undefined) patch[key] = value;
    }

    if (lowStockThreshold !== undefined) {
      patch.lowStockThreshold = lowStockThreshold;
    }

    await ctx.db.patch(id, patch);
    return { success: true };
  },
});
