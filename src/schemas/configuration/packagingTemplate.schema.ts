import { z } from "zod";

export const sizeDistributionItemSchema = z.object({
  size: z.string(),
  quantity: z.number().min(0),
});

export const packagingTemplateSchema = z
  .object({
    name: z
      .string({ message: "Le nom est requis" })
      .min(1, "Le nom est requis"),
    packagingType: z.enum(["BALE", "DOZEN"], {
      message: "Veuillez sélectionner un type d'emballage",
    }),
    totalItems: z
      .string({
        invalid_type_error: "Le total doit être un nombre supérieur à 0",
      })
      .transform((v, ctx) => {
        const parsed = parseInt(v);
        if (isNaN(parsed) || parsed <= 0) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Le total doit être un nombre supérieur à 0",
          });
          return z.NEVER;
        }
        return parsed;
      }),
    productType: z
      .string({ message: "Veuillez sélectionner un type" })
      .min(1, "Veuillez sélectionner un type"),
    productBrand: z
      .string({ message: "Veuillez sélectionner une marque" })
      .min(1, "Veuillez sélectionner une marque"),
    color: z
      .string({ message: "Veuillez sélectionner une couleur" })
      .min(1, "Veuillez sélectionner une couleur"),
    collarColor: z.string().optional(),
    sizeDistribution: z.array(sizeDistributionItemSchema),
  })
  .refine(
    (data) => {
      const nonZero = data.sizeDistribution.filter((s) => s.quantity > 0);
      if (nonZero.length === 0) return false;
      const sum = nonZero.reduce((acc, s) => acc + s.quantity, 0);
      return sum === data.totalItems;
    },
    {
      message:
        "La somme des quantités doit être égale au total d'articles",
      path: ["sizeDistribution"],
    }
  );

export type PackagingTemplateSchemaType = z.infer<
  typeof packagingTemplateSchema
>;
