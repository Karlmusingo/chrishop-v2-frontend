import { z } from "zod";

export const addZoneSchema = z.strictObject({
  name: z.string().min(3).max(80),
  description: z.string().min(1).max(256).optional(),
});

export type AddZoneSchemaType = z.infer<typeof addZoneSchema>;

export const updateZoneSchema = z.strictObject({
  name: z.string().min(3).max(80).optional(),
  description: z.string().min(1).max(256).optional(),
});

export type UpdateZoneSchemaType = z.infer<typeof updateZoneSchema>;
