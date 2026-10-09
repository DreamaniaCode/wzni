import { NextResponse } from "next/server";
import { z } from "zod";
import { database, requireAdmin, sameOrigin } from "@/lib/server";
import { defaultContent } from "@/lib/default-content";
const hex = z.string().regex(/^#[0-9a-fA-F]{6}$/);
const social = (host: string) =>
  z
    .string()
    .max(300)
    .refine((value) => {
      if (!value) return true;
      try {
        const url = new URL(value);
        return (
          url.protocol === "https:" &&
          (url.hostname === host || url.hostname === "www." + host)
        );
      } catch {
        return false;
      }
    });
const mutation = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("status"),
    id: z.uuid(),
    status: z.enum([
      "new",
      "confirmed",
      "in_delivery",
      "delivered",
      "cancelled",
    ]),
  }),
  z.object({
    type: z.literal("settings"),
    whatsapp_number: z.string().regex(/^212[67]\d{8}$/),
    cod_enabled: z.boolean(),
    chatbot_enabled: z.boolean(),
    ai_chat_enabled: z.boolean(),
    primary_color: hex,
    accent_color: hex,
    facebook_url: social("facebook.com"),
    instagram_url: social("instagram.com"),
    tiktok_url: social("tiktok.com"),
    meta_pixel_id: z
      .string()
      .regex(/^(\d{5,30})?$/)
      .default(""),
  }),
  z.object({
    type: z.literal("product"),
    sku: z.enum(["CB301-SILVER", "CB301-LED", "CB301-BLACK"]),
    name: z.string().trim().min(2).max(100),
    price_mad: z.number().int().min(1).max(100000),
    stock_quantity: z.number().int().min(0).max(100000).optional(),
    expected_stock_quantity: z.number().int().min(0).optional(),
    image_path: z
      .string()
      .regex(
        /^\/(products\/(optimized|originals)\/[a-z0-9.-]+|media\/[a-f0-9-]+\.webp)$/,
      ),
    description_fr: z.string().trim().min(2).max(500),
    description_ar: z.string().trim().min(2).max(500),
    color_hex: hex,
    color_fr: z.string().min(1).max(50),
    color_ar: z.string().min(1).max(50),
    active: z.boolean(),
  }),
  z.object({
    type: z.literal("faq"),
    id: z.number().int().positive().optional(),
    question_fr: z.string().min(2).max(500),
    answer_fr: z.string().min(2).max(2000),
    question_ar: z.string().min(2).max(500),
    answer_ar: z.string().min(2).max(2000),
    active: z.boolean(),
  }),
  z.object({
    type: z.literal("content"),
    key: z.string().refine((key) => key in defaultContent),
    text_fr: z.string().trim().min(2).max(4000),
    text_ar: z.string().trim().min(2).max(4000),
  }),
  z.object({
    type: z.literal("review"),
    id: z.uuid(),
    status: z.enum(["pending", "approved", "rejected"]),
  }),
]);
export async function GET() {
  try {
    await requireAdmin();
    const db = database();
    const [
      orders,
      settings,
      products,
      faq,
      content,
      reviews,
      counts,
      revenue,
      best,
    ] = await Promise.all([
      db.order.findMany({ orderBy: { created_at: "desc" }, take: 5000 }),
      db.storeSettings.findUnique({ where: { id: 1 } }),
      db.product.findMany({ orderBy: { sku: "asc" } }),
      db.faqEntry.findMany({ orderBy: { id: "asc" } }),
      db.contentBlock.findMany({ orderBy: { key: "asc" } }),
      db.review.findMany({ orderBy: { created_at: "desc" }, take: 200 }),
      db.order.groupBy({ by: ["status"], _count: true }),
      db.order.aggregate({
        where: { status: "delivered" },
        _sum: { total_mad: true },
      }),
      db.order.findMany({
        where: { status: "delivered" },
        select: { items: true, product_sku: true, quantity: true },
      }),
    ]);
    return NextResponse.json(
      {
        orders,
        settings,
        products,
        faq,
        content,
        reviews,
        overview: {
          counts: counts.map((c) => ({ status: c.status, count: c._count })),
          revenue: revenue._sum.total_mad || 0,
          best:
            Object.entries(
              best.reduce((totals: Record<string, number>, o) => {
                const items =
                  Array.isArray(o.items) && o.items.length
                    ? (o.items as { sku: string; quantity: number }[])
                    : [{ sku: o.product_sku, quantity: o.quantity }];
                for (const i of items)
                  totals[i.sku] = (totals[i.sku] || 0) + i.quantity;
                return totals;
              }, {}),
            ).sort((a, b) => b[1] - a[1])[0]?.[0] || "—",
        },
        ai_configured: !!(
          process.env.AI_API_KEY &&
          process.env.AI_MODEL &&
          process.env.AI_API_URL
        ),
      },
      { headers: { "Cache-Control": "private, no-store" } },
    );
  } catch (e) {
    return NextResponse.json(
      { error: "ACCESS_DENIED" },
      {
        status: e instanceof Error && e.message === "UNAUTHORIZED" ? 401 : 503,
      },
    );
  }
}
export async function PATCH(request: Request) {
  if (!sameOrigin(request))
    return NextResponse.json({ error: "ORIGIN" }, { status: 403 });
  try {
    await requireAdmin();
    const parsed = mutation.safeParse(await request.json());
    if (!parsed.success)
      return NextResponse.json({ error: "INPUT" }, { status: 400 });
    const db = database();
    switch (parsed.data.type) {
      case "status": {
        const { id, status } = parsed.data;
        await db.$transaction(async (tx) => {
          const current = await tx.order.findUniqueOrThrow({ where: { id } });
          if (current.status === status) return;
          const transitions: Record<string, string[]> = {
            new: ["confirmed", "cancelled"],
            confirmed: ["in_delivery", "cancelled"],
            in_delivery: ["delivered", "cancelled"],
          };
          if (!transitions[current.status]?.includes(status))
            throw new Error("INVALID_STATUS_TRANSITION");
          if (current.status === "cancelled" || current.status === "delivered")
            throw new Error("FINAL_STATUS");
          const updated = await tx.order.updateMany({
            where: { id, status: current.status },
            data: {
              status,
              ...(status === "cancelled" ? { stock_reserved: false } : {}),
            },
          });
          if (updated.count !== 1) throw new Error("CONCURRENT_UPDATE");
          if (status === "cancelled" && current.stock_reserved) {
            const items = current.items as { sku: string; quantity: number }[];
            for (const item of [...items].sort((a, b) =>
              a.sku.localeCompare(b.sku),
            ))
              await tx.product.update({
                where: { sku: item.sku },
                data: { stock_quantity: { increment: item.quantity } },
              });
          }
        });
        break;
      }
      case "settings": {
        const { type, ...settings } = parsed.data;
        void type;
        await db.storeSettings.update({ where: { id: 1 }, data: settings });
        break;
      }
      case "product": {
        const { type, sku, expected_stock_quantity, ...product } = parsed.data;
        void type;
        if (
          product.stock_quantity !== undefined &&
          expected_stock_quantity === undefined
        )
          return NextResponse.json(
            { error: "STOCK_REFRESH_REQUIRED" },
            { status: 409 },
          );
        const changed = await db.product.updateMany({
          where: {
            sku,
            ...(product.stock_quantity !== undefined
              ? { stock_quantity: expected_stock_quantity }
              : {}),
          },
          data: product,
        });
        if (changed.count !== 1)
          return NextResponse.json(
            { error: "STOCK_CHANGED_REFRESH" },
            { status: 409 },
          );
        break;
      }
      case "faq": {
        const { type, id, ...faq } = parsed.data;
        void type;
        if (id) await db.faqEntry.update({ where: { id }, data: faq });
        else await db.faqEntry.create({ data: faq });
        break;
      }
      case "content": {
        const { type, key, ...content } = parsed.data;
        void type;
        await db.contentBlock.upsert({
          where: { key },
          create: { key, ...content },
          update: content,
        });
        break;
      }
      case "review":
        await db.review.update({
          where: { id: parsed.data.id },
          data: { status: parsed.data.status },
        });
        break;
    }
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "UPDATE_FAILED" }, { status: 403 });
  }
}
