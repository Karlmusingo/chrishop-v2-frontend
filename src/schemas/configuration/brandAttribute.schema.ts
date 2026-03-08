import { z } from "zod";

export const brandAttributeSchema = z.object({
  value: z.string().min(1, "Le nom est requis"),
  typeId: z.string().min(1, "Le type est requis"),
  sortOrder: z.union([z.string(), z.number()]).optional().transform((v) => {
    if (v === undefined || v === "") return undefined;
    const parsed = typeof v === "number" ? v : parseInt(v);
    return isNaN(parsed) ? undefined : parsed;
  }),
});

export type BrandAttributeSchemaType = z.infer<typeof brandAttributeSchema>;
