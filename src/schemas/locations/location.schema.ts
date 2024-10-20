import { z } from "zod";

export const addLocationSchema = z.strictObject({
  name: z.string().min(3).max(80),
  province: z.string().min(1).max(10),
  city: z.string().min(1).max(10),
  address: z.string().min(1).max(80),
  contactEmail: z.string().min(1).max(80),
  contactPhoneNumber: z.string().min(1).max(80),
});

export type AddLocationSchemaType = z.infer<typeof addLocationSchema>;
