# ROOTED implementation status

## Available locally

- The scanner now shows its free ingredient result without a lead form. It checks JPG/PNG file signatures and no longer saves uploaded originals to a public bucket. Images are still sent to the configured Google Gemini service for analysis.
- The shampoo advisor has six consultation screens, review and editing, local draft recovery, a server validated matching endpoint, an explicit no-match state, and a demonstration catalogue. The fixtures are fictional and are **not** retailer offers or verified product formulations.
- Email OTP account UI and authenticated save/list/delete endpoints are present. The server checks each Supabase access token with `auth.getUser`, derives the user ID from it, and filters each operation by that ID. The included migration enables RLS for saved profiles and removes public access to legacy tables. Apply and test the migration before turning on accounts.
- The RM10 path is paused in production. The old Billplz code has not been validated against the provider's callback signature or amount and bill ID mapping. Development confirmation is blocked in production. No customer should be charged until the adapter is replaced and tested in Billplz sandbox.

## Setup

1. Install dependencies with a working npm installation, then run `npm run dev` from this directory. The app is Next.js 16.3.1, React 19.2.8 and Supabase JS 2.112.3.
2. For scanner analysis, set `GEMINI_API_KEY` on the server. Uploaded images are processed by Google; disclose this in a completed privacy notice before launch.
3. For account saving, configure `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`. The service key must stay server side. Configure Supabase's email template to send `{{ .Token }}` as a one-time code, set allowed redirect URLs, email delivery, and rate limits. The public anon key is not a secret.
4. Back up the database and apply `supabase/migrations/202609230001_advisor_security.sql`. Existing schema in `src/lib/schema.sql` must already be present. Confirm each role's select, insert, update and delete permissions in a staging Supabase project before production.
5. `APP_URL` and Billplz credentials are intentionally insufficient to turn on production checkout. Payment needs a new, verified provider adapter.

## Consultation question purpose

All six screens are for matching, not research. Hair shape and strand thickness inform texture and weight; scalp condition informs cleansing and comfort; selected concerns set priorities; recent treatments and washing routine provide care context; heat, sweat and head covering habits provide Malaysian use context; fragrance preference, known sensitivity and budget guide exclusions and ordering. “None” is exclusive wherever shown. The current consultation does not collect optional formulation research responses.

## Verification and release gates

- `node node_modules/next/dist/bin/next build`
- `node node_modules/typescript/bin/tsc --noEmit`
- `node node_modules/eslint/bin/eslint.js src`
- `node --experimental-strip-types --test tests/advisor.test.mjs`

No production Supabase project, email service, retailer catalogue, payment sandbox, browser screenshots, or test accounts were available in this workspace. Database policies, email delivery, scanner service responses, payment callbacks and full customer journeys have therefore **not** been verified against deployed integrations. The advisor introduction was opened in a browser, and the matching, authorization rejection and production safety gates were checked over local HTTP.

Before a retailer pilot, obtain a verified catalogue with variant, formula, pack size, price, listing source and verification date; agree retailer/branch scope; decide the paid feature's distinct deliverable; approve consent and retention wording; test backups and restoration; add server side rate limiting; and complete a privacy and security review. Site visitors are a convenience sample, not representative of Malaysian consumers. Research participation, marketing and product testing need separate opt-in flows before collecting that data.

The Malaysian Personal Data Protection Commissioner's current guidance and the 2024 amendment need legal review before launch. Technical controls here do not establish legal compliance. Current reference: https://www.pdp.gov.my/ppdpv1/wp-content/uploads/2025/08/GP_DBN_ENG.pdf . Supabase passwordless guidance: https://supabase.com/docs/guides/auth/auth-email-passwordless . Billplz signature guidance: https://support.billplz.com/api .
