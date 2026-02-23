import { mutation } from "../_generated/server";

const TYPES = [
  { label: "Polo", value: "polo", sortOrder: 0 },
  { label: "T-shirt", value: "t-shirt", sortOrder: 1 },
  {
    label: "T-shirt manches longues",
    value: "longsleeves t-shirt",
    sortOrder: 2,
  },
  { label: "Polo manches longues", value: "longsleeves polo", sortOrder: 3 },
];

const BRANDS = [
  { label: "Shuttle", value: "shuttle", sortOrder: 0 },
  { label: "Whatsapp", value: "whatsapp", sortOrder: 1 },
  { label: "KAF", value: "kaf", sortOrder: 2 },
];

const COLORS = [
  { label: "Yellow", value: "yellow", sortOrder: 0 },
  { label: "Red", value: "red", sortOrder: 1 },
  { label: "White", value: "white", sortOrder: 2 },
  { label: "Black", value: "black", sortOrder: 3 },
  { label: "Lemon Green", value: "lemon green", sortOrder: 4 },
  { label: "Green", value: "green", sortOrder: 5 },
  { label: "Bleu", value: "bleu", sortOrder: 6 },
  { label: "Orange", value: "orange", sortOrder: 7 },
];

const SIZES = [
  { label: "XS", value: "XS", sortOrder: 0 },
  { label: "S", value: "S", sortOrder: 1 },
  { label: "M", value: "M", sortOrder: 2 },
  { label: "L", value: "L", sortOrder: 3 },
  { label: "XL", value: "XL", sortOrder: 4 },
  { label: "2XL", value: "2XL", sortOrder: 5 },
  { label: "3XL", value: "3XL", sortOrder: 6 },
  { label: "4XL", value: "4XL", sortOrder: 7 },
];

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
