import { z } from "zod";
import { validateNumber } from "./inventories.schema";

export const transferInventoriesSchema = z.object({
  type: z.string({
    message: "Veiller selectionner le type",
  }).min(1, "Veiller selectionner le type"),
  brand: z.string({
    message: "Veiller selectionner la marque",
  }).min(1, "Veiller selectionner la marque"),
  color: z.string({
    message: "Veillez selectionner la couleur",
  }).min(1, "Veillez selectionner la couleur"),
  size: z.string({
    message: "Veillez selectionner la taille",
  }).min(1, "Veillez selectionner la taille"),
  collarColor: z.string().optional(),
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
