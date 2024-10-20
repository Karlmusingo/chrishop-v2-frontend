import { z } from "zod";

export const addCountrySchema = z.strictObject({
  name: z.string().min(3).max(80),
  countryCode: z.string().min(1).max(10),
  phoneCode: z.string().min(1).max(10),
  firstName: z.string().min(1).max(80),
  lastName: z.string().min(1).max(80),
  phoneNumber: z.string().min(1).max(80),
  email: z.string().email().min(1).max(80),
});

export type AddCountrySchemaType = z.infer<typeof addCountrySchema>;
