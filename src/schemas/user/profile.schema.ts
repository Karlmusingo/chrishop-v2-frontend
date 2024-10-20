import { z } from "zod";

export const profileSchema = z.strictObject({
  firstName: z.string().min(3).max(80).optional(),
  middleName: z.string().min(3).max(80).optional(),
  lastName: z.string().min(3).max(80).optional(),
  phoneNumber: z.string().optional(),
  email: z.string().optional(),
});

export type UpdateProfileSchemaType = z.infer<typeof profileSchema>;
