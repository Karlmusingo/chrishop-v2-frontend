import { z } from "zod";

export const addGadgetsSchema = z.strictObject({
  brand: z.string().min(1).max(80).optional(),
  deviceId: z.string().min(1).max(80),
  imei: z.string().min(1).max(80),

  companyId: z.string().uuid(),
});

export type AddGadgetSchemaType = z.infer<typeof addGadgetsSchema>;
