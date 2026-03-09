import { mutation } from "../_generated/server";
import { requireCurrentUser, requireRole } from "../lib/auth";

export const backfillAgeCategory = mutation({
  args: {},
  handler: async (ctx) => {
    const user = await requireCurrentUser(ctx);
    requireRole(user, ["ADMIN"]);

    // Backfill productSizes
    const sizes = await ctx.db.query("productSizes").collect();
    let sizesUpdated = 0;
    for (const size of sizes) {
      if (!size.ageCategory) {
        await ctx.db.patch(size._id, { ageCategory: "adult" });
        sizesUpdated++;
      }
    }

    // Backfill products that have a size field
    const products = await ctx.db.query("products").collect();
    let productsUpdated = 0;
    for (const product of products) {
      if (product.size && !product.ageCategory) {
        await ctx.db.patch(product._id, { ageCategory: "adult" });
        productsUpdated++;
      }
    }

    return { sizesUpdated, productsUpdated };
  },
});

export const removeProductFieldsFromPackagingTemplates = mutation({
  args: {},
  handler: async (ctx) => {
    const templates = await ctx.db.query("packagingTemplates").collect();
    let updated = 0;

    for (const template of templates) {
      const doc = template as any;
      if (
        doc.productType !== undefined ||
        doc.productBrand !== undefined ||
        doc.color !== undefined ||
        doc.collarColor !== undefined
      ) {
        await ctx.db.patch(template._id, {
          productType: undefined,
          productBrand: undefined,
          color: undefined,
          collarColor: undefined,
        } as any);
        updated++;
      }
    }

    return { updated, total: templates.length };
  },
});
