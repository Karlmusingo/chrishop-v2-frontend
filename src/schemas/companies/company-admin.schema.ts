import { z } from "zod";

export const addCompanyAdminSchema = z.strictObject({
  firstName: z.string().min(1).max(80),
  lastName: z.string().min(1).max(80),
  phoneNumber: z.string().min(1).max(80),
  email: z.string().min(1).max(80),
});

export type AddCompanyAdminSchemaType = z.infer<typeof addCompanyAdminSchema>;
