import { z } from "zod";
import { validateNumber } from "./inventories.schema";

export const addExistingInventoriesSchema = z.object({
  type: z.string().optional(),
  brand: z.string().optional(),
  color: z.string().optional(),
  size: z.string().optional(),
  collarColor: z.string().optional(),
  quantity: z.any().optional(),
  price: z.any().optional(),
  addQuantity: z
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

export type AddExistingInventoriesSchemaType = z.infer<
  typeof addExistingInventoriesSchema
>;
