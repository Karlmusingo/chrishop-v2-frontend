import { z } from "zod";

export const addPackagingOrderSchema = z.object({
  templateId: z
    .string({ message: "Veuillez sélectionner un modèle d'emballage" })
    .min(1, "Veuillez sélectionner un modèle d'emballage"),
  numberOfPackages: z
    .string({
      invalid_type_error: "Le nombre doit être supérieur à 0",
    })
    .transform((v, ctx) => {
      const parsed = parseInt(v);
      if (isNaN(parsed) || parsed <= 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Le nombre doit être supérieur à 0",
        });
        return z.NEVER;
      }
      return parsed;
    }),
});

export type AddPackagingOrderSchemaType = z.infer<
  typeof addPackagingOrderSchema
>;
