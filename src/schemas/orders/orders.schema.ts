import { z } from "zod";
import { validateNumber } from "../inventories/inventories.schema";

export const addOrderSchema = z.object({
  type: z.string({
    message: "Veiller selectionner le type",
  }).min(1, "Veiller selectionner le type"),
  brand: z.string({
    message: "Veiller selectionner la marque",
  }).min(1, "Veiller selectionner la marque"),
  code: z.string().optional(),
  color: z.string().optional(),
  collarColor: z.string().optional(),
  size: z.string().optional(),
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
}).refine(
  (data) => {
    return (data.code && data.code.length > 0) || (data.color && data.color.length > 0 && data.size && data.size.length > 0);
  },
  {
    message: "Veuillez fournir un code ou une couleur et taille",
    path: ["code"],
  }
);

export type AddOrderSchemaType = z.infer<typeof addOrderSchema>;
