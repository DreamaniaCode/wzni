import { NextResponse } from "next/server";
import { orderSchema } from "@/lib/validation";
import { database, rateLimit, sameOrigin } from "@/lib/server";
import { total } from "@/lib/catalog";
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
    const { website, city, expected_unit_price, ...order } = parsed.data;
    void website;
    void city;
    const existing = await db.order.findUnique({
      where: { idempotency_key: order.idempotency_key },
    });
    if (existing) {
      const same =
        existing.customer_name === order.customer_name &&
        existing.customer_phone === order.customer_phone &&
        existing.product_sku === order.product_sku &&
        existing.quantity === order.quantity &&
        existing.district === order.district &&
        existing.delivery_address === order.delivery_address &&
        existing.delivery_notes === order.delivery_notes &&
        existing.locale === order.locale;
      return same
        ? NextResponse.json({
            reference: existing.public_reference,
            total: existing.total_mad,
          })
        : NextResponse.json({ error: "IDEMPOTENCY_CONFLICT" }, { status: 409 });
    }
    const product = await db.product.findUnique({
      where: { sku: order.product_sku },
    });
    if (!product?.active)
      return NextResponse.json(
        { error: "PRODUCT_UNAVAILABLE" },
        { status: 400 },
      );
    if (
      expected_unit_price !== undefined &&
      expected_unit_price !== product.price_mad
    )
      return NextResponse.json(
        { error: "PRICE_CHANGED", unit_price: product.price_mad },
        { status: 409 },
      );
    const store = await db.storeSettings.findUnique({ where: { id: 1 } });
    const data = await db.order.create({
      data: {
        ...order,
        public_reference: "WZ-" + randomBytes(6).toString("hex").toUpperCase(),
        unit_price_mad: product.price_mad,
        delivery_fee_mad: 0,
        total_mad: total(order.quantity, product.price_mad),
        payment_method: store?.cod_enabled ? "cash_on_delivery" : "to_confirm",
      },
    });
    return NextResponse.json(
      { reference: data.public_reference, total: data.total_mad },
      { status: 201 },
    );
  } catch (error) {
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
