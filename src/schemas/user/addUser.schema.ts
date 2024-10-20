import { z } from "zod";

export const addUserSchema = z.strictObject({
  firstName: z.string().min(3).max(80),
  middleName: z.string().min(3).max(80),
  lastName: z.string().min(3).max(80),
  phoneNumber: z.string(),
  email: z.string(),
  role: z.string(),
  location: z.string().uuid().optional(),
});

export type AddUserSchemaType = z.infer<typeof addUserSchema>;
