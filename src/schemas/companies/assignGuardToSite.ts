import { z } from "zod";

export const assignGuardToSiteSchema = z.strictObject({
  guardId: z.string(),
  zoneId: z.string().optional(),
  siteId: z.string(),
});

export type AssignGuardToSiteSchemaType = z.infer<
  typeof assignGuardToSiteSchema
>;
