import { z } from "zod";

export const addCompanySchema = z.strictObject({
  name: z.string().min(1).max(80),
  countryId: z.string(),
  province: z.string().min(1).max(80).optional(),
  city: z.string().min(1).max(80).optional(),
  address: z.string().min(1).max(80),

  firstName: z.string().min(1).max(80),
  lastName: z.string().min(1).max(80),
  phoneNumber: z.string().min(1).max(80),
  email: z.string().email().min(1).max(80),
});

export type AddCompanySchemaType = z.infer<typeof addCompanySchema>;
