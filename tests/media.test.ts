import { describe, it, expect, vi, afterEach } from "vitest";
import { readFile, unlink } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
const mocks = vi.hoisted(() => ({
  requireAdmin: vi.fn(async () => ({ id: "admin" })),
  sameOrigin: vi.fn(() => true),
}));
vi.mock("../src/lib/server", () => mocks);
import { POST } from "../src/app/api/admin/media/route";
import { GET } from "../src/app/media/[filename]/route";
const files: string[] = [];
afterEach(async () => {
  for (const filename of files.splice(0)) {
    if (!/^[a-f0-9-]{36}\.webp$/.test(filename))
      throw new Error("Invalid cleanup filename");
    await unlink(path.join(process.cwd(), "data", "uploads", filename));
  }
  mocks.requireAdmin.mockResolvedValue({ id: "admin" });
});
describe("authenticated photo upload", () => {
  it("optimizes a real photo and serves the stored WebP", async () => {
    const input = await readFile("public/products/prima-black.jpg");
    const form = new FormData();
    form.set(
      "file",
      new File([input], "prima-black.jpg", { type: "image/jpeg" }),
    );
    const response = await POST(
      new Request("http://localhost/api/admin/media", {
        method: "POST",
        body: form,
      }),
    );
    expect(response.status).toBe(201);
    const { url } = await response.json();
    const filename = url.split("/").at(-1);
    files.push(filename);
    const served = await GET(new Request("http://localhost" + url), {
      params: Promise.resolve({ filename }),
    });
    expect(served.status).toBe(200);
    expect(served.headers.get("Content-Type")).toBe("image/webp");
    const metadata = await sharp(
      Buffer.from(await served.arrayBuffer()),
    ).metadata();
    expect(metadata.width).toBe(620);
    expect(metadata.exif).toBeUndefined();
  });
  it("denies anonymous uploads before reading the file", async () => {
    mocks.requireAdmin.mockRejectedValue(new Error("UNAUTHORIZED"));
    expect(
      (
        await POST(
          new Request("http://localhost/api/admin/media", { method: "POST" }),
        )
      ).status,
    ).toBe(403);
  });
  it("rejects executable image formats and traversal paths", async () => {
    const form = new FormData();
    form.set(
      "file",
      new File(["<svg/>"], "unsafe.svg", { type: "image/svg+xml" }),
    );
    expect(
      (
        await POST(
          new Request("http://localhost/api/admin/media", {
            method: "POST",
            body: form,
          }),
        )
      ).status,
    ).toBe(400);
    expect(
      (
        await GET(new Request("http://localhost/media/file"), {
          params: Promise.resolve({ filename: "../../.env" }),
        })
      ).status,
    ).toBe(404);
  });
});
