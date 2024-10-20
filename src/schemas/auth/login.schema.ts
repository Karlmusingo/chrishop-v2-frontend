import { z } from "zod";

export const loginSchema = z.strictObject({
  email: z.string().email().min(3).max(80),
  password: z.string().min(3).max(80),
});

export type LoginSchemaType = z.infer<typeof loginSchema>;
