import { afterEach, describe, expect, it, vi } from "vitest";
import { siteUrl } from "../src/lib/site-url";
afterEach(() => vi.unstubAllEnvs());
describe("deployment URL handling", () => {
  it("uses the official domain even when Coolify retains the previous domain", () => {
    vi.stubEnv("SITE_URL", "https://wzni.myskillscloud.com");
    expect(siteUrl()).toBe("https://wzni.store");
  });
  it("survives the exact Coolify placeholder that broke production", () => {
    vi.stubEnv("SITE_URL", "");
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "Set the public HTTPS domain");
    vi.stubEnv("NODE_ENV", "production");
    expect(siteUrl()).toBe("https://wzni.store");
  });
  it("normalizes runtime origins and rejects credentials and unsafe protocols", () => {
    vi.stubEnv("SITE_URL", " https://wzni.store/fr/ ");
    expect(siteUrl()).toBe("https://wzni.store");
    vi.stubEnv("SITE_URL", "javascript:alert(1)");
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://secret:password@example.com");
    vi.stubEnv("NODE_ENV", "test");
    expect(siteUrl()).toBe("http://localhost:3000");
  });
});
