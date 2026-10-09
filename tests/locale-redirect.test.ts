import { expect, it, vi } from "vitest";
const state = vi.hoisted(() => ({ locale: "fr" }));
vi.mock("next/headers", () => ({
  cookies: async () => ({ get: () => ({ value: state.locale }) }),
}));
vi.mock("next/navigation", () => ({
  redirect: (url: string) => {
    throw new Error(url);
  },
}));
import Home from "../src/app/page";
it("preserves campaign and setup query parameters when choosing a locale", async () => {
  state.locale = "fr";
  await expect(
    Home({
      searchParams: Promise.resolve({
        fbclid: "abc+123",
        utm_source: "facebook",
        setup: ["one", "two"],
      }),
    }),
  ).rejects.toThrow(
    "/fr?fbclid=abc%2B123&utm_source=facebook&setup=one&setup=two",
  );
  state.locale = "ar";
  await expect(
    Home({ searchParams: Promise.resolve({ utm_source: "facebook" }) }),
  ).rejects.toThrow("/ar?utm_source=facebook");
});
