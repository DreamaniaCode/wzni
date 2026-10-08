import { NextResponse } from "next/server";
import { requireAdmin, sameOrigin } from "@/lib/server";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import sharp from "sharp";
export async function POST(request: Request) {
  if (!sameOrigin(request))
    return NextResponse.json({ error: "ORIGIN" }, { status: 403 });
  try {
    await requireAdmin();
    if (Number(request.headers.get("content-length")) > 9 * 1024 * 1024)
      return NextResponse.json({ error: "TOO_LARGE" }, { status: 413 });
    const form = await request.formData();
    const file = form.get("file");
    if (
      !(file instanceof File) ||
      file.size > 8 * 1024 * 1024 ||
      !["image/jpeg", "image/png", "image/webp"].includes(file.type)
    )
      return NextResponse.json({ error: "INVALID_IMAGE" }, { status: 400 });
    const image = sharp(Buffer.from(await file.arrayBuffer()), {
      limitInputPixels: 25000000,
    });
    const meta = await image.metadata();
    if (
      !meta.width ||
      !meta.height ||
      !["jpeg", "png", "webp"].includes(meta.format || "")
    )
      return NextResponse.json({ error: "INVALID_IMAGE" }, { status: 400 });
    const output = await image
      .rotate()
      .resize({ width: 1600, withoutEnlargement: true })
      .webp({ quality: 90 })
      .toBuffer();
    const folder = path.join(process.cwd(), 'data', 'uploads');
    await mkdir(folder, { recursive: true });
    const filename = randomUUID() + ".webp";
    await writeFile(path.join(folder, filename), output, { flag: "wx" });
    return NextResponse.json({ url: "/media/" + filename }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "UPLOAD_FAILED" }, { status: 403 });
  }
}
