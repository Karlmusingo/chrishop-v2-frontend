import { ROLES, RolesType } from '@/interface/roles';
import { z, infer } from 'zod';

const FruitEnum = z.nativeEnum(ROLES);

export const inviteUserSchema = z.strictObject({
  email: z.string().email(),
  roles: z.string()
});

export type inviteUserSchemaType = z.infer<typeof inviteUserSchema>;
