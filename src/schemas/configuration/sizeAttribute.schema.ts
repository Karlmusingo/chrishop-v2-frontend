import { z } from "zod";

export const sizeAttributeSchema = z.object({
  value: z.string().min(1, "Le nom est requis"),
  ageCategory: z.string().min(1, "La catégorie est requise"),
  sortOrder: z.union([z.string(), z.number()]).optional().transform((v) => {
    if (v === undefined || v === "") return undefined;
    const parsed = typeof v === "number" ? v : parseInt(v);
    return isNaN(parsed) ? undefined : parsed;
  }),
});

export type SizeAttributeSchemaType = z.infer<typeof sizeAttributeSchema>;
