ALTER TABLE "products" ADD COLUMN "stock_quantity" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "products" ADD CONSTRAINT "products_stock_nonnegative" CHECK ("stock_quantity" >= 0);
-- Initial physical quantities confirmed by the merchant, 25 per existing model.
UPDATE "products" SET "stock_quantity" = 25 WHERE "sku" IN ('CB301-SILVER', 'CB301-LED', 'CB301-BLACK');
ALTER TABLE "orders" ADD COLUMN "items" JSONB NOT NULL DEFAULT '[]';
ALTER TABLE "orders" ADD COLUMN "stock_reserved" BOOLEAN NOT NULL DEFAULT false;
UPDATE "orders" SET "items" = jsonb_build_array(jsonb_build_object('sku', "product_sku", 'quantity', "quantity", 'unit_price_mad', "unit_price_mad"));
ALTER TABLE "orders" DROP CONSTRAINT "order_quantity_valid";
ALTER TABLE "orders" DROP CONSTRAINT "order_total_valid";
ALTER TABLE "orders" ADD CONSTRAINT "order_quantity_valid" CHECK (quantity BETWEEN 1 AND 60);
ALTER TABLE "orders" ADD CONSTRAINT "order_total_valid" CHECK (unit_price_mad BETWEEN 1 AND 100000 AND delivery_fee_mad=0 AND total_mad BETWEEN 1 AND 6000000);
