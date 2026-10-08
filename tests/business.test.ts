import { describe, it, expect } from "vitest";
import { total, whatsapp, products } from "../src/lib/catalog";
import { orderSchema, normalizePhone } from "../src/lib/validation";
const valid = {
  customer_name: "Test Customer",
  customer_phone: "0612345678",
  district: "Guéliz",
  delivery_address: "123 rue de test Marrakech",
  delivery_notes: "",
  product_sku: "CB301-BLACK",
  quantity: 2,
  locale: "ar",
  city: "Marrakech",
  website: "",
  idempotency_key: "06bd4554-fc69-4a8b-babc-13837883cc52",
};
describe("verified offer", () => {
  it("uses integer MAD totals", () => {
    expect([1, 2, 3].map((quantity) => total(quantity))).toEqual([
      120, 240, 360,
    ]);
  });
  it("rejects invalid quantities", () => {
    for (const n of [0, -1, 1.5, 21, NaN]) expect(() => total(n)).toThrow();
  });
  it("maps exactly three real models", () => {
    expect(products.map((p) => p.sku)).toEqual([
      "CB301-SILVER",
      "CB301-LED",
      "CB301-BLACK",
    ]);
  });
  it("creates localized encoded WhatsApp messages", () => {
    const url = new URL(whatsapp("CB301-BLACK", 2, "ar"));
    expect(url.hostname).toBe("wa.me");
    expect(url.searchParams.get("text")).toContain("240");
    expect(url.searchParams.get("text")).toContain("CB301-BLACK");
  });
});
describe("checkout validation", () => {
  it("normalizes supported Moroccan numbers", () => {
    for (const p of ["0612345678", "+212612345678", "06 12 34 56 78"])
      expect(normalizePhone(p)).toBe("+212612345678");
    expect(normalizePhone("0712345678")).toBe("+212712345678");
  });
  it("accepts a real valid payload", () => {
    const result = orderSchema.parse(valid);
    expect(result.customer_phone).toBe("+212612345678");
    expect(result.quantity).toBe(2);
  });
  it("rejects invalid phones, models, quantities, outside city and honeypot", () => {
    for (const patch of [
      { customer_phone: "0512345678" },
      { product_sku: "FAKE" },
      { quantity: 0 },
      { quantity: 2.5 },
      { city: "Rabat" },
      { website: "spam" },
      { delivery_address: "x" },
      { idempotency_key: "bad" },
    ])
      expect(orderSchema.safeParse({ ...valid, ...patch }).success).toBe(false);
  });
  it("strips client-supplied prices", () => {
    expect(
      orderSchema.parse({ ...valid, total_mad: 1, unit_price_mad: 1 }),
    ).not.toHaveProperty("total_mad");
  });
});
