import { z } from "zod";
import { validateNumber } from "../inventories/inventories.schema";

export const addOrderSchema = z.object({
  type: z.string({
    message: "Veiller selectionner le type",
  }).min(1, "Veiller selectionner le type"),
  brand: z.string({
    message: "Veiller selectionner la marque",
  }).min(1, "Veiller selectionner la marque"),
  color: z.string({
    message: "Veillez selectionner la couleur",
  }).min(1, "Veillez selectionner la couleur"),
  collarColor: z.string().optional(),
  size: z.string({
    message: "Veillez selectionner la taille",
  }).min(1, "Veillez selectionner la taille"),
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
});

export type AddOrderSchemaType = z.infer<typeof addOrderSchema>;
