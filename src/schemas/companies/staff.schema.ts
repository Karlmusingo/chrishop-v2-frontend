import { z } from "zod";

export const addStaffSchema = z.strictObject({
  role: z.string().min(1).max(80),
  zoneId: z.string().uuid().optional(),
  siteId: z.string().uuid().optional(),
  firstName: z.string().min(1).max(80),
  lastName: z.string().min(1).max(80),
  phoneNumber: z.string().min(1).max(80),
  email: z.string().min(1).max(80),
});

export type AddStaffSchemaType = z.infer<typeof addStaffSchema>;
