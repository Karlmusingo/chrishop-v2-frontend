import { z } from "zod";

export const addProductSchema = z.strictObject({
  type: z.string({
    message: "Veiller selectionner le type",
  }).min(1, "Veiller selectionner le type"),
  brand: z.string({
    message: "Veiller selectionner la marque",
  }).min(1, "Veiller selectionner la marque"),
  color: z
    .array(
      z.string({
        message: "Veillez selectionner la couleur",
      })
    )
    .nonempty("Veillez selectionner au moins une couleur"),
  size: z
    .array(
      z.string({
        message: "Veillez selectionner la taille",
      })
    )
    .nonempty("Veillez selectionner au moins une taille"),
  collarColor: z.array(z.string()).optional(),
  description: z.string().min(1, {
    message: "Veiller entrer la description",
  }),
});

export type AddProductSchemaType = z.infer<typeof addProductSchema>;
