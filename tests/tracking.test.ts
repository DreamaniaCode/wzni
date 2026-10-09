import { afterEach, beforeEach, expect, it, vi } from "vitest";
const scripts: { id: string; src: string }[] = [];
beforeEach(() => {
  vi.resetModules();
  scripts.length = 0;
  const values = new Map<string, string>();
  vi.stubGlobal("window", {});
  vi.stubGlobal("localStorage", {
    getItem: (key: string) => values.get(key),
    setItem: (key: string, value: string) => values.set(key, value),
  });
  vi.stubGlobal("document", {
    getElementById: (id: string) => scripts.find((s) => s.id === id),
    createElement: () => ({}),
    head: {
      append: (script: { id: string; src: string }) => scripts.push(script),
    },
  });
  vi.stubEnv("NEXT_PUBLIC_META_PIXEL_ID", "999999");
});
afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});
it("uses the CRM pixel without loading it before consent and sends MAD product events", async () => {
  const { configureTracking, consent, track } =
    await import("../src/components/tracking");
  configureTracking("123456789");
  track("Lead", { value: 120 });
  expect(scripts).toHaveLength(0);
  consent(true);
  expect(scripts.find((s) => s.id === "wzni-pixel")?.src).toBe(
    "https://connect.facebook.net/en_US/fbevents.js",
  );
  expect(window.fbq?.queue).toContainEqual(["init", "123456789"]);
  track("Lead", { value: 120, sku: "CB301-BLACK" });
  expect(window.fbq?.queue).toContainEqual([
    "track",
    "Lead",
    {
      value: 120,
      sku: "CB301-BLACK",
      currency: "MAD",
      content_ids: ["CB301-BLACK"],
      content_type: "product",
    },
  ]);
  consent(false);
  expect(window.fbq?.queue).toContainEqual(["consent", "revoke"]);
  const count = window.fbq?.queue.length;
  track("Lead");
  expect(window.fbq?.queue).toHaveLength(count!);
});
it("initializes the requested WZNI pixel and PageView only once after consent", async () => {
  vi.stubEnv("NEXT_PUBLIC_META_PIXEL_ID", "");
  const { consent } = await import("../src/components/tracking");
  consent(true);
  consent(true);
  expect(scripts.filter((s) => s.id === "wzni-pixel")).toHaveLength(1);
  expect(window.fbq?.queue).toContainEqual(["init", "1643060420492632"]);
  expect(
    window.fbq?.queue.filter(
      (args) => args[0] === "track" && args[1] === "PageView",
    ),
  ).toHaveLength(1);
});
it("does not load any pixel after consent refusal", async () => {
  const { configureTracking, consent } =
    await import("../src/components/tracking");
  configureTracking("123456789");
  consent(false);
  expect(scripts).toHaveLength(0);
  expect(window.fbq).toBeUndefined();
});

it("sends AddToCart as a standard catalog event", async () => {
  const { consent, track } = await import("../src/components/tracking");
  consent(true);
  track("AddToCart", { sku: "CB301-LED", quantity: 2, value: 240 });
  expect(window.fbq?.queue).toContainEqual([
    "track",
    "AddToCart",
    {
      sku: "CB301-LED",
      quantity: 2,
      value: 240,
      currency: "MAD",
      content_ids: ["CB301-LED"],
      content_type: "product",
    },
  ]);
});

it("restores accepted consent automatically and sends a catalog-matching product view", async () => {
  localStorage.setItem("wzni_consent", "yes");
  const { restoreTracking } = await import("../src/components/tracking");
  expect(
    restoreTracking("1643060420492632", { sku: "CB301-BLACK", value: 120 }),
  ).toBe(true);
  expect(window.fbq?.queue).toContainEqual(["track", "PageView", {}]);
  expect(window.fbq?.queue).toContainEqual([
    "track",
    "ViewContent",
    {
      sku: "CB301-BLACK",
      value: 120,
      currency: "MAD",
      content_ids: ["CB301-BLACK"],
      content_type: "product",
    },
  ]);
});

it("remembers refusal without requesting consent again or loading Meta", async () => {
  localStorage.setItem("wzni_consent", "no");
  const { restoreTracking } = await import("../src/components/tracking");
  expect(restoreTracking("1643060420492632", { sku: "CB301-BLACK" })).toBe(
    true,
  );
  expect(scripts).toHaveLength(0);
});
