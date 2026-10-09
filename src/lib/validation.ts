import { z } from "zod";
export function normalizePhone(value: string) {
  const phone = value.replace(/[\s()-]/g, "");
  return /^0[67]\d{8}$/.test(phone) ? "+212" + phone.slice(1) : phone;
}
export const orderSchema = z.object({
  customer_name: z.string().trim().min(2).max(100),
  customer_phone: z
    .string()
    .transform(normalizePhone)
    .pipe(z.string().regex(/^\+212[67]\d{8}$/)),
  district: z.string().trim().min(2).max(100),
  delivery_address: z.string().trim().min(8).max(500),
  delivery_notes: z.string().trim().max(500).default(""),
  product_sku: z.enum(["CB301-SILVER", "CB301-LED", "CB301-BLACK"]),
  quantity: z.number().int().min(1).max(20),
  expected_unit_price: z.number().int().min(1).max(100000).optional(),
  items: z
    .array(
      z.object({
        sku: z.enum(["CB301-SILVER", "CB301-LED", "CB301-BLACK"]),
        quantity: z.number().int().min(1).max(20),
        expected_unit_price: z.number().int().min(1).max(100000),
      }),
    )
    .min(1)
    .max(3)
    .refine((items) => new Set(items.map((i) => i.sku)).size === items.length)
    .optional(),
  locale: z.enum(["fr", "ar"]),
  city: z.literal("Marrakech"),
  website: z.string().max(0),
  idempotency_key: z.uuid(),
  utm_source: z.string().max(100).optional(),
  utm_medium: z.string().max(100).optional(),
  utm_campaign: z.string().max(100).optional(),
});
export type OrderInput = z.input<typeof orderSchema>;
