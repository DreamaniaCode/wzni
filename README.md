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

The admin command requires `ADMIN_USERNAME` (for example `wzni`, or `ADMIN_EMAIL` for an email login) and a unique `ADMIN_PASSWORD` of at least 12 characters. Supply the password for that command only, then remove it. Passwords use salted scrypt hashes. Admin sessions use random tokens stored as hashes in PostgreSQL; cookies are HttpOnly, SameSite=Lax and Secure in production. No public registration or hardcoded credential exists.

Without a database, the storefront displays catalog defaults but checkout/review submission fails honestly. It never fabricates an order reference or a saved review.

## Private CRM access

Bookmark the current address provided to the owner privately. `/admin` and the previous CRM address return 404. The CRM has no public navigation link, no sitemap entry and noindex metadata. Its uncommon URL reduces discovery; database authentication remains required. A public source repository does not make the route name a secret.

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
2. Set `POSTGRES_PASSWORD` to a strong random hexadecimal/alphanumeric value. Set `SITE_URL` and `NEXT_PUBLIC_SITE_URL` to `https://wzni.myskillscloud.com`. Enter the actual URL, never the Coolify placeholder “Set the public HTTPS domain”. Keep PostgreSQL off public ports. Runtime `SITE_URL` takes priority; invalid values fall back safely rather than crashing metadata.
3. Assign the domain to the `app` service, port 3000. Deploy. The one-off `migrate` service applies migrations/seeds without overwriting CRM edits; the app waits for it to succeed.
4. Create the first administrator from the repository checkout on the deployment server. Export `ADMIN_EMAIL` and temporarily set `ADMIN_PASSWORD` without putting it in command history, then run:

```sh
docker compose run --rm -e ADMIN_EMAIL -e ADMIN_PASSWORD migrate npm run db:admin
```

Remove `ADMIN_PASSWORD` afterward. This runs in the migration image; the slim app image omits setup tooling.

5. Sign in using the private CRM address provided to the owner, review images/text/prices and activate COD only if offered. Facebook and Instagram use @wznimaroc. TikTok remains a placeholder.
6. On staging, verify a real stored order, duplicate retry, login/security, review approval and photo persistence across redeploys.
7. Back up both named volumes: `postgres-data` and `product-uploads`. Restoring the database alone does not restore uploaded photos. Keep the app behind Coolify HTTPS; configure proxy upload-size limits and overwrite the client-IP header.

The stack uses PostgreSQL 17, a migration/seed image and a non-root standalone Next.js app. Uploaded media persists at `/app/data/uploads`. Use a URL-safe database password to avoid connection-string encoding issues. For an existing Coolify PostgreSQL resource, remove the bundled PostgreSQL service/dependency and supply its internal `DATABASE_URL` to both app and migration services.

Run `npm run db:maintenance` in the migration image periodically to delete expired sessions/rate counters. Do not remove volumes on redeploy. For Dockerfile-only deployment, choose build target `runtime` and run migrations/admin setup separately.

References: [Prisma v7 Docker](https://www.prisma.io/docs/guides/v7/deployment/docker), [Coolify Git-based Compose](https://next.coolify.io/docs/applications/builds/docker-compose).

## Environment and optional integrations

### Existing internal Coolify PostgreSQL

The default `compose.yaml` now also honors a configured `DATABASE_URL` for both the app and migrations instead of overriding it with the bundled database URL. When that variable is unset, the bundled database remains the fallback. Enable the predefined network connection when using the internal hostname. Use `compose.external.yaml` to avoid starting a bundled database entirely.

Select `compose.external.yaml` instead of `compose.yaml` to use the existing PostgreSQL resource. Enable **Connect to Predefined Network** so its internal hostname resolves. Set `DATABASE_URL` to the supplied internal URL in Coolify's environment editor; do not commit it. Set `ADMIN_USERNAME=wzni` and temporarily set `ADMIN_PASSWORD` to the requested password for the first deployment. The migration service applies all table migrations, seeds catalog/content without overwriting CRM changes, then creates/updates the administrator with a salted hash. The app starts only after setup succeeds.

After successful setup, remove `ADMIN_PASSWORD` and redeploy to remove it from the migration container environment. Later deployments apply migrations and seed safely without changing the admin password. The app service never receives `ADMIN_PASSWORD`. Back up the existing PostgreSQL resource separately; this Compose file creates no database container.

For manual setup inside the migration image or a Node 24 repository checkout on the server, set `DATABASE_URL`, `ADMIN_USERNAME=wzni` and temporarily `ADMIN_PASSWORD`, then run `npm run db:deploy`, `npm run db:seed`, and `npm run db:admin`. This requires access to the private Coolify network; the internal hostname is not reachable from a normal workstation.

Required: `DATABASE_URL`; production `SITE_URL` / `NEXT_PUBLIC_SITE_URL`. Compose also requires `POSTGRES_PASSWORD`. `ADMIN_EMAIL` / `ADMIN_PASSWORD` are one-off setup inputs.

Optional server-only `AI_API_URL`, `AI_API_KEY`, `AI_MODEL`: enable the classifier in CRM after configuration. It returns an intent only; responses use the live store knowledge base. Rate limits and input/output limits apply; failures fall back to guided mode.

For Facebook Pixel, copy the numeric ID from Meta Events Manager → your pixel/data source → Settings. Paste it in CRM → brand settings → Meta / Facebook Pixel ID and save. No rebuild is needed. Redeploy this update first so its migration adds the field. On the storefront, accept statistics consent and inspect PageView in Meta Test Events / Pixel Helper. InitiateCheckout and Lead include MAD value and product IDs; Lead fires only after the order is saved. No purchase event is emitted for an unconfirmed enquiry, and customer contact details are not sent. Refusing consent prevents loading the pixel.

Optional `NEXT_PUBLIC_GA_ID`, `NEXT_PUBLIC_META_PIXEL_ID` remain Docker build-argument fallbacks. The CRM Pixel ID takes priority. WhatsApp links open prefilled messages; nothing is sent automatically.

Three FR/AR guides live under `/{locale}/blog`; their paragraph text is editable in CRM content fields beginning with `blog`. They include canonical/hreflang metadata, BlogPosting structured data and sitemap entries. The supplied profile logo at `public/social/wzni-maroc.jpg` is used for social previews, while the main website logo stays unchanged. Testimonials come from approved submitted reviews; none are invented.

## Safeguards and legal copy

Server validation, PostgreSQL constraints, Marrakech-only included delivery, normalized Moroccan phones, integer server pricing, atomic database rate counters, honeypots, unique idempotency keys and public references. No public order-list endpoint or visitor database credential exists. Anonymous visitors cannot read customer data. Queries are parameterized by Prisma.

Orders are enquiries awaiting merchant confirmation; COD defaults off. Editable legal source is `src/app/[locale]/[legal]/page.tsx`. Supply merchant identity, data retention and return/retraction terms before commercial launch.

## Routes and assets

- `/fr`, `/ar`: store, guidance, reviews and checkout
- `/{locale}/confidentialite`, `/conditions`, `/livraison`: legal/delivery pages
- Private CRM address: orders and content CRM
- `/fr/blog`, `/ar/blog`: bilingual journal and article pages
- `/api/orders`, `/api/reviews`, `/api/chat`: customer actions
- `/api/admin`, `/api/admin/auth`, `/api/admin/media`: protected admin actions
- `/media/[filename]`, `/api/health`, `/sitemap.xml`, `/robots.txt`

Untouched source photos are in `public/products/originals`; cleaned assets are in `public/products/optimized`, with JPEG fallbacks. Reproduce processing with `npm run images -- "C:/Users/admin/Downloads"`. Hand-traced masks remove external advertising without regenerating product pixels; manually inspect changed inputs.

## Verification

Run `npm run typecheck`, `npm run lint`, `npm test`, `npm run build`, `npm run test:e2e`. Install Chromium with `npx playwright install chromium`.

Failure-case browser tests expect an unconfigured database. CRM browser tests intercept explicitly synthetic fixtures; unit tests mock Prisma persistence. Photo tests actually re-encode and serve an original supplied image. See `QA.md` for executed results and external checks. Local Docker's daemon was unavailable, so a full container/PostgreSQL deployment was not run here.
