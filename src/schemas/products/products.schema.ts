import { ProductColors } from "@/constants/colors";
import { ProductBrand } from "@/constants/productBrand";
import { ProductType } from "@/constants/productType";
import { ProductSize } from "@/constants/sizes";
import { z } from "zod";

export const addProductSchema = z.strictObject({
  type: z.nativeEnum(ProductType, {
    message: "Veiller selectionner le type",
  }),
  brand: z.nativeEnum(ProductBrand, {
    message: "Veiller selectionner la marque",
  }),
  color: z
    .array(
      z.nativeEnum(ProductColors, {
        message: "Veillez selectionner la couleur",
        required_error: "Veillez selectionner la couleur",
      })
    )
    .nonempty("Veillez selectionner au moins une couleur"),
  size: z
    .array(
      z.nativeEnum(ProductSize, {
        message: "Veillez selectionner la taille",
        required_error: "Veillez selectionner la taille",
      })
    )
    .nonempty("Veillez selectionner au moins une taille"),
  collarColor: z.array(z.nativeEnum(ProductColors)).optional(),
  description: z.string().min(1, {
    message: "Veiller entrer la description",
  }),
});

export type AddProductSchemaType = z.infer<typeof addProductSchema>;
