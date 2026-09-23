# ROOTED implementation status

## Available locally

- The scanner now shows its free ingredient result without a lead form. It checks JPG/PNG file signatures and no longer saves uploaded originals to a public bucket. Images are still sent to the configured Google Gemini service for analysis.
- The shampoo advisor has six consultation screens, review and editing, local draft recovery, a server validated matching endpoint, an explicit no-match state, and 10 real Malaysian-market shampoo records with online source evidence. The app currently reads the bundled versioned catalogue; prices are dated snapshots and formulations have not been checked against physical bottles.
- Email OTP account UI and authenticated save/list/delete endpoints are present. The server checks each Supabase access token with `auth.getUser`, derives the user ID from it, and filters each operation by that ID. The included migration enables RLS for saved profiles and removes public access to legacy tables. Apply and test the migration before turning on accounts.
- The RM10 path is paused in production. The old Billplz code has not been validated against the provider's callback signature or amount and bill ID mapping. Development confirmation is blocked in production. No customer should be charged until the adapter is replaced and tested in Billplz sandbox.

## Setup

1. Install dependencies with a working npm installation, then run `npm run dev` from this directory. The app is Next.js 16.3.1, React 19.2.8 and Supabase JS 2.112.3.
2. For scanner analysis, set `GEMINI_API_KEY` on the server. Uploaded images are processed by Google; disclose this in a completed privacy notice before launch.
3. For account saving, configure `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`. The service key must stay server side. Configure Supabase's email template to send `{{ .Token }}` as a one-time code, set allowed redirect URLs, email delivery, and rate limits. The public anon key is not a secret.
4. Back up the database and apply `supabase/migrations/202609230001_advisor_security.sql`. Existing schema in `src/lib/schema.sql` must already be present. Confirm each role's select, insert, update and delete permissions in a staging Supabase project before production.
5. `APP_URL` and Billplz credentials are intentionally insufficient to turn on production checkout. Payment needs a new, verified provider adapter.

## Consultation question purpose

The consultation is for product guidance, not research. Selected concerns, strand thickness, scalp, treatments and washing frequency influence matching to published claims. Hair shape and daily activities inform routine notes, not ranking. Fragrance preference changes ordering; known fragrance sensitivity and regular listed prices set exclusions. “None” is exclusive wherever shown. The current consultation does not collect optional formulation research responses.

## Verification and release gates

- `node node_modules/next/dist/bin/next build`
- `node node_modules/typescript/bin/tsc --noEmit`
- `node node_modules/eslint/bin/eslint.js src`
- `node --experimental-strip-types --test tests/advisor.test.mjs`

See WEBSITE_REVIEW.md for the latest checks and remaining release work. Hosted Supabase policies, email delivery, scanner-provider responses and payments have not been verified against deployed integrations.

Before a retailer pilot, obtain a verified catalogue with variant, formula, pack size, price, listing source and verification date; agree retailer/branch scope; decide the paid feature's distinct deliverable; approve consent and retention wording; test backups and restoration; add server side rate limiting; and complete a privacy and security review. Site visitors are a convenience sample, not representative of Malaysian consumers. Research participation, marketing and product testing need separate opt-in flows before collecting that data.

The Malaysian Personal Data Protection Commissioner's current guidance and the 2024 amendment need legal review before launch. Technical controls here do not establish legal compliance. Current reference: https://www.pdp.gov.my/ppdpv1/wp-content/uploads/2025/08/GP_DBN_ENG.pdf . Supabase passwordless guidance: https://supabase.com/docs/guides/auth/auth-email-passwordless . Billplz signature guidance: https://support.billplz.com/api .


## Sourced catalogue and database

src/data/shampoos.my.json is the current curated source of truth, version my-2026-09-23-v1. Both the public catalogue and advisor use it. ADVISOR_VERSION includes the catalogue version so saved result snapshots retain their provenance.

To provision the database, back up the target and apply the existing security migration, then supabase/migrations/202609230002_shampoo_catalogue.sql and supabase/seed_shampoos.sql in Supabase's SQL editor or migration workflow. The catalogue migration is independent of legacy product data. It creates product, formulation and retailer-listing tables with public read access only to source-reviewed records; client writes are denied.

Regenerate the seed with node scripts/catalogue-seed.mjs after a source review and catalogue version update. Re-running the seed upserts the same IDs. The migration runs once. Applying the seed does not switch application reads to Supabase; that requires an explicit repository adapter and integration tests. No hosted database was modified during this task.

Do not mix this curated catalogue with legacy development recommendation fixtures. Never publish a service-role key. Refer to WEBSITE_REVIEW.md for sourcing limitations and IMAGE_PROVENANCE.md for artwork provenance.
