import { z } from "zod";

export const bulkTransferIndividualSchema = z
  .object({
    type: z
      .string({ message: "Veiller selectionner le type" })
      .min(1, "Veiller selectionner le type"),
    brand: z
      .string({ message: "Veiller selectionner la marque" })
      .min(1, "Veiller selectionner la marque"),
    code: z.string().optional(),
    color: z.string().optional(),
    collarColor: z.string().optional(),
    sizeDistribution: z.array(z.object({
      size: z.string(),
      quantity: z.number(),
    })).default([]),
    transferQuantity: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.code && data.code.length > 0) return true;
      if (!data.color || data.color.length === 0) return false;
      const hasNonZero = data.sizeDistribution.some((s) => s.quantity > 0);
      return hasNonZero;
    },
    {
      message: "Veuillez fournir un code ou une couleur avec au moins une taille",
      path: ["code"],
    }
  );

export type BulkTransferIndividualSchemaType = z.infer<
  typeof bulkTransferIndividualSchema
>;
