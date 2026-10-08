import { readFile } from "node:fs/promises";
import path from "node:path";
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ filename: string }> },
) {
  const { filename } = await params;
  if (!/^[a-f0-9-]{36}\.webp$/.test(filename))
    return new Response("Not found", { status: 404 });
  try {
    const file = await readFile(
      path.join(
        process.cwd(), 'data', 'uploads',
        filename,
      ),
    );
    return new Response(new Uint8Array(file), {
      headers: {
        "Content-Type": "image/webp",
        "Cache-Control": "public, max-age=31536000, immutable",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
