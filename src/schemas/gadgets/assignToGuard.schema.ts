import { z } from "zod";

export const assignToGuardSchema = z.strictObject({
  guardId: z.string(),
  gadgetId: z.string(),
  siteId: z.string().optional(),
});

export type AssignToGuardSchemaType = z.infer<typeof assignToGuardSchema>;
