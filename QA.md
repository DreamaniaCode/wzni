# WZNI verification — Prisma / Coolify revision

Executed in this workspace for the latest revision.

## Passed

- Strict TypeScript check and ESLint.
- Prisma 7 client generation and schema validation.
- Production Next.js standalone build, without upload-path tracing warnings. Locale pages, admin APIs, media, reviews, health, sitemap and robots routes generated successfully.
- 31 unit/API tests: pricing and Moroccan phone validation; configurable server prices; stale-price rejection; order retries/idempotency; honest database failures; unauthorized admin access; salted password hashing; protected content changes; social URL validation; pending review storage; and actual Sharp upload/WebP serving, including rejected image formats and path traversal.
- Six Chromium browser tests: FR/AR switching and RTL; exactly identical logo layout; BLACK selection and quantity 2 / 240 DH; honest offline checkout; guided chat and WhatsApp total; no mobile overflow; real color choices; usage/SEO text; disabled social placeholders; review failure handling; and CRM price/text/social controls with synthetic intercepted fixtures.
- Desktop French and mobile FR/AR screenshots visually inspected in `artifacts/`. Original product processing was also visually reviewed, with untouched originals preserved.
- `docker compose config --no-interpolate --quiet`: passed.
- `npm audit --omit=dev`: zero vulnerabilities after patched transitive overrides for deepmerge-ts and mysql2. Prisma generation/validation and build still pass with those versions.

The five remaining full-audit findings are development-only lint dependencies through braces → micromatch → fast-glob → Next ESLint. npm's proposed forced downgrade is incompatible with the current Next version, so it was not applied. Lint only trusted source trees and monitor the upstream fix.

## Scope of verification

Requested Meta Pixel 1643060420492632 was saved to live CRM settings and configured as the application fallback. All three tracking tests passed, including consent refusal, MAD/product events and exactly one initialization/PageView on repeated acceptance. Meta Events Manager receipt was not inspected because no account access was supplied.

Content organization update: human-readable French field labels and placement descriptions replace raw content keys. Site copy is grouped into home page, usage advice and Google SEO, with character counters and a French search preview. Existing article bodies move to a separate Blog navigation section. The CRM browser scenario passed for grouping, preview, saving both languages, article/site separation and existing management controls; the SEO capture was visually inspected. The homepage metadata now uses the exact saved title rather than appending a price.

CRM organization update: separate navigation for orders/products/content/reviews/settings/FAQ, automatic existing-session loading, French order statuses, visible search/empty states and product editor labels. The Chromium CRM scenario passed using intercepted synthetic data: automatic dashboard entry, order row visibility, filtering/reset, product price saves, content/social changes, zero-order state and mobile overflow. Desktop order/product and mobile product captures were visually inspected. No synthetic order was written to PostgreSQL. TypeScript and ESLint passed.

Proxy routing correction: later server logs showed Next.js ready and successful migrations/seeding, despite public health requests timing out. Both Compose files now explicitly set traefik.docker.network to the shared Coolify network, avoiding ambiguous backend network selection for the app's two network interfaces. Compose syntax is validated; live proxy recovery requires redeployment and a successful external health request.

Deployment networking correction: supplied Coolify logs showed Prisma P1001 to the internal standalone PostgreSQL hostname while `app` had no logs because it awaited the migration service. Both Compose definitions now attach app/migrations to the existing shared Coolify network. Compose syntax validation passed for both files. The actual server-side network attachment must still be confirmed during redeployment.

Recurring 504 investigation: the supplied generated Compose contained a literal escaped variable in `traefik.docker.network`. Both Compose sources now use the literal `coolify` network and an explicit HTTPS router/service targeting HTTP port 3000. Syntax checks passed for both definitions; live proxy recovery remains unverified until Coolify redeploys.

SEO/access update: shared metadata now covers FR/AR storefronts, journal, articles and legal pages with titles/descriptions, canonical/hreflang, Open Graph and Twitter cards. ICO/SVG/Apple icons are generated from the code-native WZNI mark. Eight Chromium tests passed using one worker and a 60-second overall test limit; their assertions verify live metadata/icon responses, language sitemap alternates, no public CRM links and the previous CRM URL returning 404. The icon was visually inspected. The 38 unit/API tests, TypeScript and ESLint passed. Compose interpolation was checked with dummy credentials for both a configured external DATABASE_URL and the bundled fallback, without connecting to either test target.

Latest update: 35 unit/API tests and seven Chromium browser tests passed, along with TypeScript, ESLint and Prisma schema validation. Added regression coverage for the exact invalid Coolify URL placeholder, safe URL normalization, CRM-configured Pixel initialization/consent and MAD events, bilingual blog pages, social preview metadata, old `/admin` returning 404 and CRM exclusion from the sitemap. The article layout was visually inspected.

A production build was run with `NEXT_PUBLIC_SITE_URL=Set the public HTTPS domain` and an empty `SITE_URL`. Local production HTTP checks returned 200 without rendering-error digests for FR/AR storefronts, FR/AR articles and sitemap; the canonical URL used the correct production fallback. The public deployed response exposed the invalid site URL before this fix. The server itself has not been redeployed from this workspace; live migration and Pixel Events Manager verification remain deployment checks.

Order/CRM/review unit tests mock Prisma responses. CRM browser fixtures are synthetic and do not represent real customers or approved testimonials. Photo tests process a supplied product image and write/serve/delete their own generated test upload.

Local Docker is installed but its Linux daemon was stopped. No full Docker image or Compose/PostgreSQL stack was started. No Coolify credentials or live database connection were supplied. Actual migration application, PostgreSQL persistence, authenticated admin sessions, server deployment, volume permissions and restoration remain external staging checks.

## Before commercial launch

Meta catalog tracking correction: the consent banner now hides for saved acceptance/refusal, and saved acceptance starts tracking automatically. Initial and selected product views send `content_ids` matching the WZNI SKU plus MAD price. Five tracking regressions verify consent restoration and event payloads. The Meta catalog item IDs must independently match `CB301-SILVER`, `CB301-LED`, and `CB301-BLACK`; no catalog access or catalog edits were performed.

Live PostgreSQL setup subsequently completed using the user-provided public endpoint: all three migrations applied to the initially empty database, the catalog/content/FAQ seed completed, and the requested administrator was created with a salted password hash. A temporary local production server connected to that database successfully authenticated the username, read the protected CRM (3 products, 20 content blocks, 7 FAQs and configured Facebook/Instagram links), then logged out and deleted its verification session. Username/email authentication regressions bring the unit/API suite to 38 passing tests; TypeScript, ESLint, production build and external Compose syntax validation also passed. Coolify runtime environment changes and redeployment still require authenticated dashboard access.

Follow the Coolify instructions in README, create the administrator, test persisted orders and reviews on staging, verify uploaded photos survive a redeploy, and back up both database and media volumes. Complete merchant identity, retention and return/retraction terms. Fill the real social-page URLs, keep color descriptions faithful to product photos, and activate COD only if offered.
