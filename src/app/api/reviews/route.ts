import { NextResponse } from "next/server";
import { z } from "zod";
import { database, rateLimit, sameOrigin } from "@/lib/server";
export const reviewSchema = z.object({
  customer_name: z.string().trim().min(2).max(60),
  locale: z.enum(["fr", "ar"]),
  rating: z.number().int().min(1).max(5),
  text: z.string().trim().min(15).max(1000),
  website: z.string().max(0),
});
export async function POST(request: Request) {
  if (!sameOrigin(request))
    return NextResponse.json({ error: "ORIGIN" }, { status: 403 });
  try {
    const raw = await request.text();
    if (raw.length > 6000)
      return NextResponse.json({ error: "INPUT" }, { status: 413 });
    const result = reviewSchema.safeParse(JSON.parse(raw));
    if (!result.success)
      return NextResponse.json({ error: "VALIDATION" }, { status: 400 });
    if (!(await rateLimit(request, "reviews", 3)))
      return NextResponse.json({ error: "RATE_LIMIT" }, { status: 429 });
    const { website, ...data } = result.data;
    void website;
    await database().review.create({ data: { ...data, status: "pending" } });
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "SERVICE_UNAVAILABLE" }, { status: 503 });
  }
}
