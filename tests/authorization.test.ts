import { describe, it, expect, vi } from "vitest";
import { isAdmin } from "../src/lib/admin-policy";
const mocks = vi.hoisted(() => ({
  requireAdmin: vi.fn(),
  database: vi.fn(),
  sameOrigin: vi.fn(() => true),
}));
vi.mock("../src/lib/server", () => mocks);
import { GET, PATCH } from "../src/app/api/admin/route";
describe("administrator authorization", () => {
  it("defaults to denying access and checks exact IDs", () => {
    expect(isAdmin("user", "")).toBe(false);
    expect(isAdmin("", "")).toBe(false);
    expect(isAdmin("user", "user2")).toBe(false);
    expect(isAdmin("admin-one", " admin-one,admin-two ")).toBe(true);
  });
  it("does not access order data for unauthorized reads", async () => {
    mocks.requireAdmin.mockRejectedValue(new Error("UNAUTHORIZED"));
    const response = await GET();
    expect(response.status).toBe(401);
    expect(mocks.database).not.toHaveBeenCalled();
  });
  it("rejects unauthorized mutations", async () => {
    mocks.requireAdmin.mockRejectedValue(new Error("UNAUTHORIZED"));
    const response = await PATCH(
      new Request("http://localhost:3000/api/admin", {
        method: "PATCH",
        body: JSON.stringify({
          type: "status",
          id: "06bd4554-fc69-4a8b-babc-13837883cc52",
          status: "delivered",
        }),
      }),
    );
    expect(response.status).toBe(403);
    expect(mocks.database).not.toHaveBeenCalled();
  });
});
