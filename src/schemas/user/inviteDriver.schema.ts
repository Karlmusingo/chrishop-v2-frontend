import { z } from 'zod';

export const inviteDriverSchema = z.strictObject({
  firstName: z.string().min(3).max(80),
  lastName: z.string().min(3).max(80),
  phone: z.string().min(7).max(20),
});

export type inviteDriverSchemaType = z.infer<typeof inviteDriverSchema>;
