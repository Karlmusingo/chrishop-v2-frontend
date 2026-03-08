import { mutation } from "../_generated/server";

const TYPES = [
  { value: "Polo", sortOrder: 0 },
  { value: "T-shirt", sortOrder: 1 },
  { value: "T-shirt manches longues", sortOrder: 2 },
  { value: "Polo manches longues", sortOrder: 3 },
];

const BRANDS = [
  { value: "Shuttle", sortOrder: 0 },
  { value: "Whatsapp", sortOrder: 1 },
  { value: "KAF", sortOrder: 2 },
];

const COLORS = [
  { value: "Yellow", sortOrder: 0 },
  { value: "Red", sortOrder: 1 },
  { value: "White", sortOrder: 2 },
  { value: "Black", sortOrder: 3 },
  { value: "Lemon Green", sortOrder: 4 },
  { value: "Green", sortOrder: 5 },
  { value: "Bleu", sortOrder: 6 },
  { value: "Orange", sortOrder: 7 },
];

const SIZES = [
  { value: "XS", sortOrder: 0 },
  { value: "S", sortOrder: 1 },
  { value: "M", sortOrder: 2 },
  { value: "L", sortOrder: 3 },
  { value: "XL", sortOrder: 4 },
  { value: "2XL", sortOrder: 5 },
  { value: "3XL", sortOrder: 6 },
  { value: "4XL", sortOrder: 7 },
];

export const removeLabelField = mutation({
  args: {},
  handler: async (ctx) => {
    const tables = [
      "productTypes",
      "productBrands",
      "productColors",
      "productSizes",
    ] as const;
    let count = 0;

    for (const table of tables) {
      const items = await ctx.db.query(table).collect();
      for (const item of items) {
        if ("label" in item) {
          const { label, ...rest } = item as any;
          await ctx.db.replace(item._id, rest);
          count++;
        }
      }
    }

    return { updated: count };
  },
});

export const seedAll = mutation({
  args: {},
  handler: async (ctx) => {
    const counts = { types: 0, brands: 0, colors: 0, sizes: 0 };

    for (const item of TYPES) {
      const existing = await ctx.db
        .query("productTypes")
        .withIndex("by_value", (q) => q.eq("value", item.value))
        .first();
      if (!existing) {
        await ctx.db.insert("productTypes", item);
        counts.types++;
      }
    }

    for (const item of BRANDS) {
      const existing = await ctx.db
        .query("productBrands")
        .withIndex("by_value", (q) => q.eq("value", item.value))
        .first();
      if (!existing) {
        await ctx.db.insert("productBrands", item);
        counts.brands++;
      }
    }

    for (const item of COLORS) {
      const existing = await ctx.db
        .query("productColors")
        .withIndex("by_value", (q) => q.eq("value", item.value))
        .first();
      if (!existing) {
        await ctx.db.insert("productColors", item);
        counts.colors++;
      }
    }

    for (const item of SIZES) {
      const existing = await ctx.db
        .query("productSizes")
        .withIndex("by_value", (q) => q.eq("value", item.value))
        .first();
      if (!existing) {
        await ctx.db.insert("productSizes", item);
        counts.sizes++;
      }
    }

    return counts;
  },
});
