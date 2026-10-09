import { NextResponse } from "next/server";
import { z } from "zod";
import {
  database,
  rateLimit,
  sameOrigin,
  startSession,
  endSession,
} from "@/lib/server";
import { verifyPassword } from "@/lib/password";
import { adminIdentifier } from "@/lib/admin-login";
export async function POST(request: Request) {
  if (!sameOrigin(request))
    return NextResponse.json({ error: "ORIGIN" }, { status: 403 });
  try {
    const parsed = z
      .object({
        email: adminIdentifier,
        password: z.string().min(1).max(200),
      })
      .safeParse(await request.json());
    if (!parsed.success)
      return NextResponse.json({ error: "INPUT" }, { status: 400 });
    if (!(await rateLimit(request, "auth", 5)))
      return NextResponse.json({ error: "RATE_LIMIT" }, { status: 429 });
    const user = await database().adminUser.findUnique({
      where: { email: parsed.data.email.toLowerCase() },
    });
    const hash =
      user?.password_hash ||
      "scrypt:00000000000000000000000000000000:" + "00".repeat(64);
    if (!(await verifyPassword(parsed.data.password, hash)) || !user?.active)
      return NextResponse.json({ error: "ACCESS_DENIED" }, { status: 401 });
    await startSession(user.id);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "STORE_UNCONFIGURED" }, { status: 503 });
  }
}
export async function DELETE(request: Request) {
  if (!sameOrigin(request))
    return NextResponse.json({ error: "ORIGIN" }, { status: 403 });
  try {
    await endSession();
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "SERVICE_UNAVAILABLE" }, { status: 503 });
  }
}
