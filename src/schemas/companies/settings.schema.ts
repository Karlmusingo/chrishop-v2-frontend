import { z } from "zod";

export const settingsSchema = z.strictObject({
  name: z.string().min(1).max(80).optional(),
  province: z.string().min(1).max(80).optional(),
  city: z.string().min(1).max(80).optional(),
  address: z.string().min(1).max(80).optional(),
  contactEmail: z.string().email().min(1).max(80).optional(),
  contactPhoneNumber: z.string().min(1).max(80).optional(),

  reminderInterval: z.string().min(1).max(5).optional(),
  stepCount: z.string().min(1).max(5).optional(),
});

export type UpdateSettingsSchemaType = z.infer<typeof settingsSchema>;
