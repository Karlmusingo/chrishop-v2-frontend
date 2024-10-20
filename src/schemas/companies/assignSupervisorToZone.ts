import { z } from "zod";

export const assignSupervisorToZoneSchema = z.strictObject({
  supervisorId: z.string(),
  zoneId: z.string(),
});

export type AssignSupervisorToZoneSchemaType = z.infer<
  typeof assignSupervisorToZoneSchema
>;
