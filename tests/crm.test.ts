import { describe, it, expect, beforeEach, vi } from "vitest";
import { hashPassword, verifyPassword } from "../src/lib/password";
import { storeCopy, liveFaqs } from "../src/lib/store-copy";
import { products, total, whatsapp } from "../src/lib/catalog";
const mocks = vi.hoisted(() => ({
  database: vi.fn(),
  requireAdmin: vi.fn(),
  sameOrigin: vi.fn(() => true),
  rateLimit: vi.fn(async () => true),
}));
vi.mock("../src/lib/server", () => mocks);
import { PATCH } from "../src/app/api/admin/route";
import { POST as reviewPost } from "../src/app/api/reviews/route";
beforeEach(() => {
  vi.clearAllMocks();
  mocks.requireAdmin.mockResolvedValue({ id: "admin" });
  mocks.sameOrigin.mockReturnValue(true);
  mocks.rateLimit.mockResolvedValue(true);
});
describe("CMS price consistency", () => {
  it("uses changed prices in totals, WhatsApp, announcement and FAQ", () => {
    const catalog = products.map((p) => ({ ...p, price: 135 }));
    expect(total(2, 135)).toBe(270);
    expect(
      decodeURIComponent(
        whatsapp("CB301-BLACK", 2, "fr", undefined, undefined, 135),
      ),
    ).toContain("270 DH");
    expect(storeCopy("fr", catalog, []).announcement).toContain("135 DH");
    expect(liveFaqs("fr", catalog)[0][1]).toContain("135 DH");
    expect(storeCopy("ar", catalog, []).announcement).toContain("135");
  });
  it("loads the saved bilingual text", () => {
    const rows = [
      { key: "hero_headline", text_fr: "Titre modifié", text_ar: "عنوان جديد" },
    ];
    expect(storeCopy("fr", products, rows).headline).toBe("Titre modifié");
    expect(storeCopy("ar", products, rows).headline).toBe("عنوان جديد");
  });
});
describe("secure admin credentials", () => {
  it("salts and verifies passwords", async () => {
    const first = await hashPassword("a-long-test-password"),
      second = await hashPassword("a-long-test-password");
    expect(first).not.toBe(second);
    expect(await verifyPassword("a-long-test-password", first)).toBe(true);
    expect(await verifyPassword("wrong", first)).toBe(false);
    expect(await verifyPassword("wrong", "malformed")).toBe(false);
  });
});
describe("CRM mutations", () => {
  it("persists authorized content changes", async () => {
    const upsert = vi.fn(async () => ({}));
    mocks.database.mockReturnValue({ contentBlock: { upsert } });
    const response = await PATCH(
      new Request("http://localhost/api/admin", {
        method: "PATCH",
        body: JSON.stringify({
          type: "content",
          key: "hero_headline",
          text_fr: "Votre style",
          text_ar: "ستايلك",
        }),
      }),
    );
    expect(response.status).toBe(200);
    expect(upsert).toHaveBeenCalledWith({
      where: { key: "hero_headline" },
      create: {
        key: "hero_headline",
        text_fr: "Votre style",
        text_ar: "ستايلك",
      },
      update: { text_fr: "Votre style", text_ar: "ستايلك" },
    });
  });
  it("rejects unsupported social domains", async () => {
    const response = await PATCH(
      new Request("http://localhost/api/admin", {
        method: "PATCH",
        body: JSON.stringify({
          type: "settings",
          whatsapp_number: "212783009072",
          cod_enabled: false,
          chatbot_enabled: true,
          ai_chat_enabled: false,
          primary_color: "#101828",
          accent_color: "#16A34A",
          facebook_url: "javascript:alert(1)",
          instagram_url: "",
          tiktok_url: "",
        }),
      }),
    );
    expect(response.status).toBe(400);
    expect(mocks.database).not.toHaveBeenCalled();
  });
});
describe("customer reviews", () => {
  it("stores reviews as pending rather than publishing them", async () => {
    const create = vi.fn(async () => ({ id: "review" }));
    mocks.database.mockReturnValue({ review: { create } });
    const response = await reviewPost(
      new Request("http://localhost/api/reviews", {
        method: "POST",
        body: JSON.stringify({
          customer_name: "Test client",
          locale: "fr",
          rating: 4,
          text: "Une expérience synthétique de test.",
          website: "",
        }),
      }),
    );
    expect(response.status).toBe(201);
    expect(create).toHaveBeenCalledWith({
      data: expect.objectContaining({ status: "pending", rating: 4 }),
    });
  });
  it("returns an error instead of a false saved-review response", async () => {
    mocks.database.mockImplementation(() => {
      throw new Error("STORE_UNCONFIGURED");
    });
    expect(
      (
        await reviewPost(
          new Request("http://localhost/api/reviews", {
            method: "POST",
            body: JSON.stringify({
              customer_name: "Test client",
              locale: "ar",
              rating: 5,
              text: "هذا رأي تجريبي وليس رأياً حقيقياً.",
              website: "",
            }),
          }),
        )
      ).status,
    ).toBe(503);
  });
});
