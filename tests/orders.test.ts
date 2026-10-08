import { beforeEach, describe, it, expect, vi } from "vitest";
const mocks = vi.hoisted(() => ({
  database: vi.fn(),
  sameOrigin: vi.fn(() => true),
  rateLimit: vi.fn(async () => true),
}));
vi.mock("../src/lib/server", () => mocks);
import { POST } from "../src/app/api/orders/route";
const payload = {
  customer_name: "Test Client",
  customer_phone: "0612345678",
  district: "Guéliz",
  delivery_address: "12 rue test Marrakech",
  delivery_notes: "",
  product_sku: "CB301-BLACK",
  quantity: 2,
  locale: "fr",
  city: "Marrakech",
  website: "",
  idempotency_key: "06bd4554-fc69-4a8b-babc-13837883cc52",
  unit_price_mad: 1,
  total_mad: 1,
};
function request(value: unknown = payload) {
  return new Request("http://localhost:3000/api/orders", {
    method: "POST",
    headers: {
      Origin: "http://localhost:3000",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(value),
  });
}
function fakeDb(existing: unknown = null, unitPrice = 120) {
  return {
    order: {
      findUnique: vi.fn(async () => existing),
      create: vi.fn(async () => ({
        public_reference: "WZ-TEST",
        total_mad: unitPrice * 2,
      })),
    },
    product: {
      findUnique: vi.fn(async () => ({
        sku: "CB301-BLACK",
        price_mad: unitPrice,
        active: true,
      })),
    },
    storeSettings: { findUnique: vi.fn(async () => ({ cod_enabled: false })) },
  };
}
beforeEach(() => {
  vi.clearAllMocks();
  mocks.sameOrigin.mockReturnValue(true);
  mocks.rateLimit.mockResolvedValue(true);
});
describe("Prisma order submission", () => {
  it("uses server price, normalizes phone and returns persisted reference", async () => {
    const db = fakeDb();
    mocks.database.mockReturnValue(db);
    const response = await POST(request());
    expect(response.status).toBe(201);
    expect(await response.json()).toEqual({ reference: "WZ-TEST", total: 240 });
    expect(db.order.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        unit_price_mad: 120,
        total_mad: 240,
        delivery_fee_mad: 0,
        customer_phone: "+212612345678",
        payment_method: "to_confirm",
      }),
    });
  });
  it("uses an edited CRM price", async () => {
    const db = fakeDb(null, 135);
    mocks.database.mockReturnValue(db);
    const response = await POST(request());
    expect(await response.json()).toEqual({ reference: "WZ-TEST", total: 270 });
    expect(db.order.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ unit_price_mad: 135, total_mad: 270 }),
    });
  });
  it("rejects a stale customer price without writing an order", async () => {
    const db = fakeDb(null, 135);
    mocks.database.mockReturnValue(db);
    expect(
      (await POST(request({ ...payload, expected_unit_price: 120 }))).status,
    ).toBe(409);
    expect(db.order.create).not.toHaveBeenCalled();
  });
  it("returns the original reference on an identical retry", async () => {
    const db = fakeDb({
      ...payload,
      customer_phone: "+212612345678",
      public_reference: "WZ-EXISTING",
      total_mad: 240,
    });
    mocks.database.mockReturnValue(db);
    const response = await POST(request());
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      reference: "WZ-EXISTING",
      total: 240,
    });
    expect(db.order.create).not.toHaveBeenCalled();
  });
  it("rejects changed payloads using the same idempotency key", async () => {
    const db = fakeDb({
      ...payload,
      customer_phone: "+212612345678",
      delivery_address: "Different address",
    });
    mocks.database.mockReturnValue(db);
    expect((await POST(request())).status).toBe(409);
    expect(db.order.create).not.toHaveBeenCalled();
  });
  it("never reports success for database write failure", async () => {
    const db = fakeDb();
    db.order.create.mockRejectedValue(new Error("Unavailable"));
    mocks.database.mockReturnValue(db);
    const response = await POST(request());
    expect(response.status).toBe(503);
    expect(await response.json()).not.toHaveProperty("reference");
  });
  it("fails honestly without configured database", async () => {
    mocks.database.mockImplementation(() => {
      throw new Error("STORE_UNCONFIGURED");
    });
    expect(await (await POST(request())).json()).toEqual({
      error: "STORE_UNCONFIGURED",
    });
  });
  it("rejects outside-city addresses and invalid inputs", async () => {
    expect((await POST(request({ ...payload, city: "Rabat" }))).status).toBe(
      400,
    );
    expect(mocks.database).not.toHaveBeenCalled();
  });
  it("rejects foreign origins", async () => {
    mocks.sameOrigin.mockReturnValue(false);
    expect((await POST(request())).status).toBe(403);
  });
  it("enforces rate limits", async () => {
    mocks.rateLimit.mockResolvedValue(false);
    expect((await POST(request())).status).toBe(429);
    expect(mocks.database).not.toHaveBeenCalled();
  });
});
