import { z } from "zod";

export const addSiteSchema = z.strictObject({
  name: z.string().min(1).max(80).optional(),
  province: z.string().min(1).max(80),
  city: z.string().min(1).max(80),
  address: z.string().min(1).max(80),
  zoneId: z.string().uuid(),
  location: z
    .object({
      latitude: z.coerce.number(),
      longitude: z.coerce.number(),
    })
    .optional(),

  firstName: z.string().min(1).max(80),
  lastName: z.string().min(1).max(80),
  phoneNumber: z.string().min(1).max(80),
  email: z.string().min(1).max(80),
});

export type AddSiteSchemaType = z.infer<typeof addSiteSchema>;

export const updateSiteSchema = z.strictObject({
  name: z.string().min(1).max(80).optional(),
  province: z.string().min(1).max(80).optional(),
  city: z.string().min(1).max(80).optional(),
  address: z.string().min(1).max(80).optional(),
  zoneId: z.string().uuid().optional(),
  location: z
    .object({
      latitude: z.coerce.number(),
      longitude: z.coerce.number(),
    })
    .optional(),
  reminderInterval: z.string().min(1).max(5).optional(),
  stepCount: z.string().min(1).max(5).optional(),
});

export type UpdateSiteSchemaType = z.infer<typeof updateSiteSchema>;
