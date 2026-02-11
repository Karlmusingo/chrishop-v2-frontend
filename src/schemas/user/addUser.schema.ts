import { z } from "zod";

export const addUserSchema = z.strictObject({
  firstName: z.string().min(3).max(80),
  middleName: z.string().min(3).max(80),
  lastName: z.string().min(3).max(80),
  phoneNumber: z.string(),
  email: z.string(),
  role: z.enum(["ADMIN", "MANAGER", "SELLER", "CASHIER"]),
  location: z.string().optional(),
});

export type AddUserSchemaType = z.infer<typeof addUserSchema>;
