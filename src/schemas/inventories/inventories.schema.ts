import { z } from "zod";

export const validateNumber = (
  ctx: z.RefinementCtx,
  value: number,
  name: string
) => {
  if (isNaN(value)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: `${name} doit être un nombre`,
    });

    return z.NEVER;
  }

  if (value <= 0) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: `${name} doit être supérieur à 0`,
    });

    return z.NEVER;
  }
};

export const addInventoriesSchema = z.object({
  type: z.string({
    message: "Veiller selectionner le type",
  }).min(1, "Veiller selectionner le type"),
  brand: z.string({
    message: "Veiller selectionner la marque",
  }).min(1, "Veiller selectionner la marque"),
  code: z.string().optional(),
  color: z.string().optional(),
  collarColor: z.string().optional(),
  sizeDistribution: z.array(z.object({
    size: z.string(),
    quantity: z.number(),
  })).default([]),
  quantity: z.string().optional(),
  price: z
    .string({
      invalid_type_error: "Le prix doit être un nombre supérieur à 0",
    })
    .transform((v, ctx) => {
      const parsed = parseInt(v);
      const zValid = validateNumber(ctx, parsed, "Le prix");
      if (zValid) {
        return zValid;
      }
      return parsed;
    }),
}).refine(
  (data) => {
    if (data.code && data.code.length > 0) return true;
    if (!data.color || data.color.length === 0) return false;
    const hasNonZero = data.sizeDistribution.some((s) => s.quantity > 0);
    return hasNonZero;
  },
  {
    message: "Veuillez fournir un code ou une couleur avec au moins une taille",
    path: ["code"],
  }
);

export type AddInventoriesSchemaType = z.infer<typeof addInventoriesSchema>;
