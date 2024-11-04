import { z } from "zod";

export const updatePasswordSchema = z.strictObject({
  password: z.string().min(3).max(80),
  newPassword: z.string().min(3).max(80),
  confirmPassword: z.string().min(3).max(80),
});

export type UpdatePasswordSchemaType = z.infer<typeof updatePasswordSchema>;
