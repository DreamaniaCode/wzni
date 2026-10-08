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

Order/CRM/review unit tests mock Prisma responses. CRM browser fixtures are synthetic and do not represent real customers or approved testimonials. Photo tests process a supplied product image and write/serve/delete their own generated test upload.

Local Docker is installed but its Linux daemon was stopped. No full Docker image or Compose/PostgreSQL stack was started. No Coolify credentials or live database connection were supplied. Actual migration application, PostgreSQL persistence, authenticated admin sessions, server deployment, volume permissions and restoration remain external staging checks.

## Before commercial launch

Follow the Coolify instructions in README, create the administrator, test persisted orders and reviews on staging, verify uploaded photos survive a redeploy, and back up both database and media volumes. Complete merchant identity, retention and return/retraction terms. Fill the real social-page URLs, keep color descriptions faithful to product photos, and activate COD only if offered.
