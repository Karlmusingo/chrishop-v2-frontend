import { z } from "zod";

export const attributeSchema = z.object({
  label: z.string().min(1, "Le libellé est requis"),
  value: z.string().min(1, "La valeur est requise"),
  sortOrder: z.union([z.string(), z.number()]).optional().transform((v) => {
    if (v === undefined || v === "") return undefined;
    const parsed = typeof v === "number" ? v : parseInt(v);
    return isNaN(parsed) ? undefined : parsed;
  }),
});

export type AttributeSchemaType = z.infer<typeof attributeSchema>;
