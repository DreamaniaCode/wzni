import { NextResponse } from "next/server";
import { orderSchema } from "@/lib/validation";
import { database, rateLimit, sameOrigin } from "@/lib/server";

import { randomBytes } from "node:crypto";
export async function POST(request: Request) {
  if (!sameOrigin(request))
    return NextResponse.json({ error: "ORIGIN" }, { status: 403 });
  try {
    const raw = await request.text();
    if (raw.length > 6000)
      return NextResponse.json({ error: "INPUT" }, { status: 413 });
    let input;
    try {
      input = JSON.parse(raw);
    } catch {
      return NextResponse.json({ error: "VALIDATION" }, { status: 400 });
    }
    const parsed = orderSchema.safeParse(input);
    if (!parsed.success)
      return NextResponse.json({ error: "VALIDATION" }, { status: 400 });
    if (!(await rateLimit(request, "orders", 10)))
      return NextResponse.json({ error: "RATE_LIMIT" }, { status: 429 });

    const db = database();
    const { website, city, expected_unit_price, items, ...order } = parsed.data;
    void website;
    void city;
    const requested = (
      items || [
        {
          sku: order.product_sku,
          quantity: order.quantity,
          expected_unit_price,
        },
      ]
    ).sort((a, b) => a.sku.localeCompare(b.sku));
    const result = await db.$transaction(async (tx) => {
      const existing = await tx.order.findUnique({
        where: { idempotency_key: order.idempotency_key },
      });
      if (existing) {
        const previous =
          Array.isArray(existing.items) && existing.items.length
            ? (existing.items as { sku: string; quantity: number }[])
            : [{ sku: existing.product_sku, quantity: existing.quantity }];
        const same =
          [
            "customer_name",
            "customer_phone",
            "district",
            "delivery_address",
            "delivery_notes",
            "locale",
          ].every(
            (k) =>
              existing[k as keyof typeof existing] ===
              order[k as keyof typeof order],
          ) &&
          JSON.stringify(
            previous
              .map((i) => ({ sku: i.sku, quantity: i.quantity }))
              .sort((a, b) => a.sku.localeCompare(b.sku)),
          ) ===
            JSON.stringify(
              requested.map((i) => ({ sku: i.sku, quantity: i.quantity })),
            );
        if (!same) throw new Error("IDEMPOTENCY_CONFLICT");
        return { data: existing, created: false };
      }
      const lines: {
        sku: string;
        quantity: number;
        unit_price_mad: number;
        name: string;
      }[] = [];
      for (const item of requested) {
        const product = await tx.product.findUnique({
          where: { sku: item.sku },
        });
        if (!product?.active) throw new Error("PRODUCT_UNAVAILABLE");
        if (
          item.expected_unit_price !== undefined &&
          item.expected_unit_price !== product.price_mad
        )
          throw new Error("PRICE_CHANGED");
        const reserved = await tx.product.updateMany({
          where: {
            sku: item.sku,
            active: true,
            stock_quantity: { gte: item.quantity },
          },
          data: { stock_quantity: { decrement: item.quantity } },
        });
        if (reserved.count !== 1) throw new Error("OUT_OF_STOCK");
        lines.push({
          sku: item.sku,
          quantity: item.quantity,
          unit_price_mad: product.price_mad,
          name: product.name,
        });
      }
      const store = await tx.storeSettings.findUnique({ where: { id: 1 } });
      const data = await tx.order.create({
        data: {
          ...order,
          product_sku: lines[0].sku,
          quantity: lines.reduce((n, i) => n + i.quantity, 0),
          unit_price_mad: lines[0].unit_price_mad,
          items: lines,
          stock_reserved: true,
          public_reference:
            "WZ-" + randomBytes(6).toString("hex").toUpperCase(),
          delivery_fee_mad: 0,
          total_mad: lines.reduce(
            (n, i) => n + i.quantity * i.unit_price_mad,
            0,
          ),
          payment_method: store?.cod_enabled
            ? "cash_on_delivery"
            : "to_confirm",
        },
      });
      return { data, created: true };
    });
    return NextResponse.json(
      { reference: result.data.public_reference, total: result.data.total_mad },
      { status: result.created ? 201 : 200 },
    );
  } catch (error) {
    if (
      error instanceof Error &&
      [
        "OUT_OF_STOCK",
        "PRICE_CHANGED",
        "PRODUCT_UNAVAILABLE",
        "IDEMPOTENCY_CONFLICT",
      ].includes(error.message)
    )
      return NextResponse.json({ error: error.message }, { status: 409 });
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === "P2002"
    )
      return NextResponse.json(
        { error: "RETRY_SAME_REQUEST" },
        { status: 409 },
      );
    return NextResponse.json(
      {
        error:
          error instanceof Error && error.message === "STORE_UNCONFIGURED"
            ? "STORE_UNCONFIGURED"
            : "SERVICE_UNAVAILABLE",
      },
      { status: 503 },
    );
  }
}
