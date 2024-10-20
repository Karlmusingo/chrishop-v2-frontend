import { ProductColors } from "@/constants/colors";
import { ProductBrand } from "@/constants/productBrand";
import { ProductType } from "@/constants/productType";
import { ProductSize } from "@/constants/sizes";
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
  type: z.nativeEnum(ProductType, {
    message: "Veiller selectionner le type",
  }),
  brand: z.nativeEnum(ProductBrand, {
    message: "Veiller selectionner la marque",
  }),
  color: z.nativeEnum(ProductColors, {
    message: "Veillez selectionner la couleur",
  }),
  size: z.nativeEnum(ProductSize, {
    message: "Veillez selectionner la taille",
  }),
  collarColor: z.nativeEnum(ProductColors).optional(),
  quantity: z
    .string({
      invalid_type_error: "La quantité doit être un nombre supérieur à 0",
    })
    .transform((v, ctx) => {
      const parsed = parseInt(v);
      const zValid = validateNumber(ctx, parsed, "La quantité");
      if (zValid) {
        return zValid;
      }
      return parsed;
    }),
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
});

export type AddInventoriesSchemaType = z.infer<typeof addInventoriesSchema>;
