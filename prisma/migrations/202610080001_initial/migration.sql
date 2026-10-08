-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "products" (
    "sku" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "image_path" TEXT NOT NULL,
    "price_mad" INTEGER NOT NULL DEFAULT 120,
    "description_fr" TEXT NOT NULL,
    "description_ar" TEXT NOT NULL,
    "color_hex" TEXT NOT NULL,
    "color_fr" TEXT NOT NULL,
    "color_ar" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "products_pkey" PRIMARY KEY ("sku")
);

-- CreateTable
CREATE TABLE "orders" (
    "id" UUID NOT NULL,
    "public_reference" TEXT NOT NULL,
    "idempotency_key" UUID NOT NULL,
    "customer_name" TEXT NOT NULL,
    "customer_phone" TEXT NOT NULL,
    "district" TEXT NOT NULL,
    "delivery_address" TEXT NOT NULL,
    "delivery_notes" TEXT NOT NULL DEFAULT '',
    "product_sku" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unit_price_mad" INTEGER NOT NULL,
    "delivery_fee_mad" INTEGER NOT NULL DEFAULT 0,
    "total_mad" INTEGER NOT NULL,
    "payment_method" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'new',
    "locale" TEXT NOT NULL,
    "utm_source" TEXT,
    "utm_medium" TEXT,
    "utm_campaign" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "store_settings" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "whatsapp_number" TEXT NOT NULL DEFAULT '212783009072',
    "cod_enabled" BOOLEAN NOT NULL DEFAULT false,
    "chatbot_enabled" BOOLEAN NOT NULL DEFAULT true,
    "ai_chat_enabled" BOOLEAN NOT NULL DEFAULT false,
    "primary_color" TEXT NOT NULL DEFAULT '#101828',
    "accent_color" TEXT NOT NULL DEFAULT '#16A34A',
    "facebook_url" TEXT NOT NULL DEFAULT '',
    "instagram_url" TEXT NOT NULL DEFAULT '',
    "tiktok_url" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "store_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "content_blocks" (
    "key" TEXT NOT NULL,
    "text_fr" TEXT NOT NULL,
    "text_ar" TEXT NOT NULL,

    CONSTRAINT "content_blocks_pkey" PRIMARY KEY ("key")
);

-- CreateTable
CREATE TABLE "faq_entries" (
    "id" SERIAL NOT NULL,
    "question_fr" TEXT NOT NULL,
    "answer_fr" TEXT NOT NULL,
    "question_ar" TEXT NOT NULL,
    "answer_ar" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "faq_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reviews" (
    "id" UUID NOT NULL,
    "customer_name" TEXT NOT NULL,
    "locale" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "text" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rate_limits" (
    "bucket" TEXT NOT NULL,
    "hits" INTEGER NOT NULL,
    "expires_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "rate_limits_pkey" PRIMARY KEY ("bucket")
);

-- CreateTable
CREATE TABLE "admin_users" (
    "id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "admin_users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admin_sessions" (
    "token_hash" TEXT NOT NULL,
    "user_id" UUID NOT NULL,
    "expires_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "admin_sessions_pkey" PRIMARY KEY ("token_hash")
);

-- CreateIndex
CREATE UNIQUE INDEX "orders_public_reference_key" ON "orders"("public_reference");

-- CreateIndex
CREATE UNIQUE INDEX "orders_idempotency_key_key" ON "orders"("idempotency_key");

-- CreateIndex
CREATE INDEX "orders_status_created_at_idx" ON "orders"("status", "created_at");

-- CreateIndex
CREATE INDEX "orders_product_sku_idx" ON "orders"("product_sku");

-- CreateIndex
CREATE INDEX "reviews_status_created_at_idx" ON "reviews"("status", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "admin_users_email_key" ON "admin_users"("email");

-- CreateIndex
CREATE INDEX "admin_sessions_expires_at_idx" ON "admin_sessions"("expires_at");

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_product_sku_fkey" FOREIGN KEY ("product_sku") REFERENCES "products"("sku") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "admin_sessions" ADD CONSTRAINT "admin_sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "admin_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

