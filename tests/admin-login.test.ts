import { beforeEach, expect, it, vi } from "vitest";
import { adminIdentifier } from "../src/lib/admin-login";
const mocks = vi.hoisted(() => ({
  findUnique: vi.fn(),
  verifyPassword: vi.fn(),
  startSession: vi.fn(),
  rateLimit: vi.fn(),
  sameOrigin: vi.fn(),
}));
vi.mock("../src/lib/server", () => ({
  database: () => ({ adminUser: { findUnique: mocks.findUnique } }),
  rateLimit: mocks.rateLimit,
  sameOrigin: mocks.sameOrigin,
  startSession: mocks.startSession,
  endSession: vi.fn(),
}));
vi.mock("../src/lib/password", () => ({
  verifyPassword: mocks.verifyPassword,
}));
import { POST } from "../src/app/api/admin/auth/route";
beforeEach(() => {
  vi.clearAllMocks();
  mocks.rateLimit.mockResolvedValue(true);
  mocks.sameOrigin.mockReturnValue(true);
});
it("accepts usernames and existing emails while rejecting malformed identifiers", () => {
  expect(adminIdentifier.parse(" WZNI ")).toBe("wzni");
  expect(adminIdentifier.parse("Admin@example.com")).toBe("admin@example.com");
  expect(adminIdentifier.safeParse("wzni/../../").success).toBe(false);
});
it("authenticates wzni through the same password and session checks", async () => {
  mocks.findUnique.mockResolvedValue({
    id: "admin-id",
    password_hash: "salted-hash",
    active: true,
  });
  mocks.verifyPassword.mockResolvedValue(true);
  const response = await POST(
    new Request("http://localhost/api/admin/auth", {
      method: "POST",
      body: JSON.stringify({ email: "WZNI", password: "test-password-only" }),
    }),
  );
  expect(response.status).toBe(200);
  expect(mocks.findUnique).toHaveBeenCalledWith({ where: { email: "wzni" } });
  expect(mocks.verifyPassword).toHaveBeenCalledWith(
    "test-password-only",
    "salted-hash",
  );
  expect(mocks.startSession).toHaveBeenCalledWith("admin-id");
});
it("does not create a session for an incorrect password", async () => {
  mocks.findUnique.mockResolvedValue({
    id: "admin-id",
    password_hash: "salted-hash",
    active: true,
  });
  mocks.verifyPassword.mockResolvedValue(false);
  const response = await POST(
    new Request("http://localhost/api/admin/auth", {
      method: "POST",
      body: JSON.stringify({ email: "wzni", password: "incorrect-password" }),
    }),
  );
  expect(response.status).toBe(401);
  expect(mocks.startSession).not.toHaveBeenCalled();
});
