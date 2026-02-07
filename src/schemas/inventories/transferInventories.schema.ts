import { ProductColors } from "@/constants/colors";
import { ProductBrand } from "@/constants/productBrand";
import { ProductType } from "@/constants/productType";
import { ProductSize } from "@/constants/sizes";
import { z } from "zod";
import { validateNumber } from "./inventories.schema";

export const transferInventoriesSchema = z.object({
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
  quantity: z.any().optional(),
  price: z.any().optional(),
  location: z
    .string({
      message: "Veillez selectionner la boutique",
      required_error: "Veillez selectionner la boutique",
    })
    .min(1, "Veillez selectionner la boutique"),
  transferQuantity: z
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
});

export type TransferInventoriesSchemaType = z.infer<
  typeof transferInventoriesSchema
>;
