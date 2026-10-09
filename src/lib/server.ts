import "server-only";
import { cookies } from "next/headers";
import { createHash, randomBytes } from "node:crypto";
import { database } from "./prisma";
import { products, type Product } from "./catalog";
import { defaultContent } from "./default-content";
import { siteUrl } from "./site-url";
export { database } from "./prisma";
export const sessionCookie = "wzni_admin_session";
export const tokenHash = (token: string) =>
  createHash("sha256").update(token).digest("hex");
export async function requireAdmin() {
  const jar = await cookies();
  const token = jar.get(sessionCookie)?.value;
  if (!token) throw new Error("UNAUTHORIZED");
  const session = await database().adminSession.findUnique({
    where: { token_hash: tokenHash(token) },
    include: { user: true },
  });
  if (!session || session.expires_at < new Date() || !session.user.active)
    throw new Error("UNAUTHORIZED");
  return session.user;
}
export async function startSession(userId: string) {
  const token = randomBytes(32).toString("hex"),
    expires = new Date(Date.now() + 8 * 60 * 60 * 1000);
  await database().adminSession.create({
    data: {
      token_hash: tokenHash(token),
      user_id: userId,
      expires_at: expires,
    },
  });
  const jar = await cookies();
  jar.set(sessionCookie, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires,
  });
}
export async function endSession() {
  const jar = await cookies();
  const token = jar.get(sessionCookie)?.value;
  if (token)
    await database().adminSession.deleteMany({
      where: { token_hash: tokenHash(token) },
    });
  jar.delete(sessionCookie);
}
export function sameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  const trusted = siteUrl();
  return origin === new URL(request.url).origin || origin === trusted;
}
export async function rateLimit(
  request: Request,
  scope: string,
  maxHits: number,
  seconds = 600,
) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const bucket = scope + ":" + createHash("sha256").update(ip).digest("hex");
  const rows = await database().$queryRaw<
    { hits: number }[]
  >`INSERT INTO rate_limits (bucket,hits,expires_at) VALUES (${bucket},1,NOW()+make_interval(secs=>${seconds})) ON CONFLICT (bucket) DO UPDATE SET hits=CASE WHEN rate_limits.expires_at<NOW() THEN 1 ELSE rate_limits.hits+1 END,expires_at=CASE WHEN rate_limits.expires_at<NOW() THEN NOW()+make_interval(secs=>${seconds}) ELSE rate_limits.expires_at END RETURNING hits`;
  return rows[0].hits <= maxHits;
}
export async function settings() {
  try {
    return await database().storeSettings.findUnique({ where: { id: 1 } });
  } catch {
    return null;
  }
}
export async function publicData() {
  const content = Object.entries(defaultContent).map(([key, value]) => ({
    key,
    text_fr: value.fr,
    text_ar: value.ar,
  }));
  try {
    const db = database();
    const [catalog, store, blocks, faq, reviews] = await Promise.all([
      db.product.findMany({ orderBy: { sku: "asc" } }),
      db.storeSettings.findUnique({ where: { id: 1 } }),
      db.contentBlock.findMany(),
      db.faqEntry.findMany({ where: { active: true }, orderBy: { id: "asc" } }),
      db.review.findMany({
        where: { status: "approved" },
        orderBy: { created_at: "desc" },
        take: 12,
        select: {
          id: true,
          customer_name: true,
          text: true,
          rating: true,
          locale: true,
        },
      }),
    ]);
    return {
      catalog: products.map((original) => {
        const row = catalog.find((p) => p.sku === original.sku);
        return row
          ? {
              ...original,
              name: row.name,
              image: row.image_path,
              price: row.price_mad,
              descriptionFr: row.description_fr,
              descriptionAr: row.description_ar,
              colorHex: row.color_hex,
              colorFr: row.color_fr,
              colorAr: row.color_ar,
              active: row.active,
            }
          : { ...original, active: false };
      }) as Product[],
      store,
      content: blocks.length
        ? content.map(
            (defaultRow) =>
              blocks.find((b) => b.key === defaultRow.key) || defaultRow,
          )
        : content,
      faq,
      reviews,
    };
  } catch {
    return {
      catalog: [...products] as Product[],
      store: null,
      content,
      faq: [],
      reviews: [],
    };
  }
}
