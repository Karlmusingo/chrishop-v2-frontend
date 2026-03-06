import { mutation } from "../_generated/server";

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
