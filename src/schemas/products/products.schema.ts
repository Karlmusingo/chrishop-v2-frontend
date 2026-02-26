import { z } from "zod";

export const addProductSchema = z.strictObject({
  type: z.string({
    message: "Veiller selectionner le type",
  }).min(1, "Veiller selectionner le type"),
  brand: z.string({
    message: "Veiller selectionner la marque",
  }).min(1, "Veiller selectionner la marque"),
  code: z.string().optional(),
  color: z
    .array(
      z.string({
        message: "Veillez selectionner la couleur",
      })
    )
    .optional(),
  collarColor: z.array(z.string()).optional(),
  size: z
    .array(
      z.string({
        message: "Veillez selectionner la taille",
      })
    )
    .optional(),
  description: z.string().min(1, {
    message: "Veiller entrer la description",
  }),
}).refine(
  (data) => {
    return (data.code && data.code.length > 0) || (data.color && data.color.length > 0 && data.size && data.size.length > 0);
  },
  {
    message: "Veuillez fournir un code ou des couleurs et tailles",
    path: ["code"],
  }
);

export type AddProductSchemaType = z.infer<typeof addProductSchema>;
