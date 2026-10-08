# WZNI | وزني

Bilingual PRIMA scale shop for Marrakech with a small content CRM: French/Arabic RTL, one fixed bilingual logo, authentic cleaned photos, real color/design choices, editable prices and copy, moderated customer reviews, usage guidance, local SEO and social-page placeholders.

## Stack and local setup

Next.js 16, strict TypeScript, Tailwind, Motion, React Hook Form, Zod, Prisma ORM 7 (supported v7 track), PostgreSQL and Sharp. Supabase has been replaced; its old migration folder is archived.

Use Node.js 24 LTS. Run `npm ci`, copy `.env.example` to `.env`, set `DATABASE_URL`, then:

```sh
npm run db:deploy
npm run db:seed
npm run db:admin
npm run dev
```

The admin command requires `ADMIN_EMAIL` and a unique `ADMIN_PASSWORD` of at least 12 characters. Supply the password for that command only, then remove it. Passwords use salted scrypt hashes. Admin sessions use random tokens stored as hashes in PostgreSQL; cookies are HttpOnly, SameSite=Lax and Secure in production. No public registration or hardcoded credential exists.

Without a database, the storefront displays catalog defaults but checkout/review submission fails honestly. It never fabricates an order reference or a saved review.

## CRM: /admin

- Orders, status changes, search/filter, customer WhatsApp contact and CSV export.
- Dashboard totals aggregate across the database. The table/export shows the latest 5,000 orders; older records require database reporting.
- Three products: photo, name, integer MAD price, FR/AR descriptions, true color labels/swatches and visibility.
- JPG/PNG/WebP uploads up to 8 MB. Sharp re-encodes to WebP, strips metadata, limits pixels and avoids upscaling. Photos persist in `data/uploads`, served through UUID-only `/media/...` URLs.
- Bilingual hero/closing titles, descriptions, usage guidance, local SEO text and metadata.
- Theme colors and official Facebook, Instagram and TikTok URLs. Empty URLs show “Bientôt / قريباً”, with no fake links.
- Bilingual FAQ and review moderation. Reviews start pending; only approved reviews appear. They are not presented as verified purchases.

Use original photos of the real product, keep color labels accurate and avoid prices in free-form text. Database prices drive cards, checkout, WhatsApp, chat and Product structured data. A changed price during checkout requires a page refresh before an order is saved. Existing orders retain their original unit price.

The fixed logo is `src/components/brand-logo.tsx`, with identical Latin/Arabic arrangement and typography in both locales. Usage and well-being content is general, with NHS source links in the interface. No unsupported PRIMA capacity, precision, connectivity or medical claims are made.

## Coolify deployment

Repository: [DreamaniaCode/wzni](https://github.com/DreamaniaCode/wzni).

1. Create a Git-based application in Coolify using the Docker Compose build pack. Select the implementation branch and `compose.yaml`.
2. Set `POSTGRES_PASSWORD` to a strong random hexadecimal/alphanumeric value and `NEXT_PUBLIC_SITE_URL` to the final HTTPS domain. Keep PostgreSQL off public ports.
3. Assign the domain to the `app` service, port 3000. Deploy. The one-off `migrate` service applies migrations/seeds without overwriting CRM edits; the app waits for it to succeed.
4. Create the first administrator from the repository checkout on the deployment server. Export `ADMIN_EMAIL` and temporarily set `ADMIN_PASSWORD` without putting it in command history, then run:

```sh
docker compose run --rm -e ADMIN_EMAIL -e ADMIN_PASSWORD migrate npm run db:admin
```

Remove `ADMIN_PASSWORD` afterward. This runs in the migration image; the slim app image omits setup tooling.

5. Sign in at `/admin`, review images/text/prices, add real social links and activate COD only if offered.
6. On staging, verify a real stored order, duplicate retry, login/security, review approval and photo persistence across redeploys.
7. Back up both named volumes: `postgres-data` and `product-uploads`. Restoring the database alone does not restore uploaded photos. Keep the app behind Coolify HTTPS; configure proxy upload-size limits and overwrite the client-IP header.

The stack uses PostgreSQL 17, a migration/seed image and a non-root standalone Next.js app. Uploaded media persists at `/app/data/uploads`. Use a URL-safe database password to avoid connection-string encoding issues. For an existing Coolify PostgreSQL resource, remove the bundled PostgreSQL service/dependency and supply its internal `DATABASE_URL` to both app and migration services.

Run `npm run db:maintenance` in the migration image periodically to delete expired sessions/rate counters. Do not remove volumes on redeploy. For Dockerfile-only deployment, choose build target `runtime` and run migrations/admin setup separately.

References: [Prisma v7 Docker](https://www.prisma.io/docs/guides/v7/deployment/docker), [Coolify Git-based Compose](https://next.coolify.io/docs/applications/builds/docker-compose).

## Environment and optional integrations

Required: `DATABASE_URL`; production `NEXT_PUBLIC_SITE_URL`. Compose also requires `POSTGRES_PASSWORD`. `ADMIN_EMAIL` / `ADMIN_PASSWORD` are one-off setup inputs.

Optional server-only `AI_API_URL`, `AI_API_KEY`, `AI_MODEL`: enable the classifier in CRM after configuration. It returns an intent only; responses use the live store knowledge base. Rate limits and input/output limits apply; failures fall back to guided mode.

Optional `NEXT_PUBLIC_GA_ID`, `NEXT_PUBLIC_META_PIXEL_ID`: consent-gated analytics, supplied as Docker build arguments. No customer data is sent. Lead is recorded only after a successful order write. WhatsApp links open prefilled messages; nothing is sent automatically.

## Safeguards and legal copy

Server validation, PostgreSQL constraints, Marrakech-only included delivery, normalized Moroccan phones, integer server pricing, atomic database rate counters, honeypots, unique idempotency keys and public references. No public order-list endpoint or visitor database credential exists. Anonymous visitors cannot read customer data. Queries are parameterized by Prisma.

Orders are enquiries awaiting merchant confirmation; COD defaults off. Editable legal source is `src/app/[locale]/[legal]/page.tsx`. Supply merchant identity, data retention and return/retraction terms before commercial launch.

## Routes and assets

- `/fr`, `/ar`: store, guidance, reviews and checkout
- `/{locale}/confidentialite`, `/conditions`, `/livraison`: legal/delivery pages
- `/admin`: orders and content CRM
- `/api/orders`, `/api/reviews`, `/api/chat`: customer actions
- `/api/admin`, `/api/admin/auth`, `/api/admin/media`: protected admin actions
- `/media/[filename]`, `/api/health`, `/sitemap.xml`, `/robots.txt`

Untouched source photos are in `public/products/originals`; cleaned assets are in `public/products/optimized`, with JPEG fallbacks. Reproduce processing with `npm run images -- "C:/Users/admin/Downloads"`. Hand-traced masks remove external advertising without regenerating product pixels; manually inspect changed inputs.

## Verification

Run `npm run typecheck`, `npm run lint`, `npm test`, `npm run build`, `npm run test:e2e`. Install Chromium with `npx playwright install chromium`.

Failure-case browser tests expect an unconfigured database. CRM browser tests intercept explicitly synthetic fixtures; unit tests mock Prisma persistence. Photo tests actually re-encode and serve an original supplied image. See `QA.md` for executed results and external checks. Local Docker's daemon was unavailable, so a full container/PostgreSQL deployment was not run here.
