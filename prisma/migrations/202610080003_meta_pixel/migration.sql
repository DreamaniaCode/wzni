ALTER TABLE "store_settings" ADD COLUMN "meta_pixel_id" TEXT NOT NULL DEFAULT '';
UPDATE "store_settings" SET "facebook_url" = 'https://www.facebook.com/wznimaroc' WHERE "facebook_url" = '';
UPDATE "store_settings" SET "instagram_url" = 'https://www.instagram.com/wznimaroc/' WHERE "instagram_url" = '';
