# ROOTED website review — 23 September 2026

## Improvements made

- **Real recommendations:** replaced fictional products with 10 Malaysian-market listings. Results show exact pack size, source links, ingredient snapshots and dated prices. Budget filters use regular listed prices rather than temporary discounts.
- **More useful matching:** selected concerns, scalp, strand thickness, treatment history and washing frequency affect ranking. Fragrance sensitivity excludes scented products, including fragrant essential oils. Hair shape and daily activities inform routine notes. Results are not padded with products that have no relevant overlap when a concern is selected.
- **Clear evidence:** added `/catalogue` to browse every record. Manufacturer and retailer claims are identified as claims. Formula snapshots are not physical-bottle verification; branch stock remains unknown.
- **Original imagery:** added an optimized, 119 KB editorial WebP to the homepage and advisor introduction. The unbranded AI-created bottles are decorative, not representations of catalogue products. Retailer links lead to authentic packaging photos.
- **Easier navigation and recovery:** added advisor/catalogue navigation, readable answer summaries, step restoration after refresh, validated drafts, and heading focus between screens. Refreshing a finished result returns to review so it can be regenerated against the current rules.
- **Scanner correction fix:** ingredient editing is available even when recognition reports high confidence. Applied corrections clear the old summary, suitability and consideration text. Cancelling an edit no longer invalidates the original result.

## Recommended next improvements, in priority order

1. **Connect and verify the hosted catalogue and accounts.** The site currently reads the versioned catalogue bundled with the app. The normalized Supabase schema and generated seed are ready, but have not been applied to a hosted database. Test email delivery and account save/load/delete with two separate users before enabling public saving.
2. **Broaden product coverage.** Ten products are a useful starting set, with limited low-budget and fragrance-free coverage. Add more products only after checking the exact Malaysian variant, pack, formulation and listing. Add a review queue and a price/formula review cadence; do not label snapshots as live prices.
3. **Test the scanner with real labels.** Check glare, curved bottles, small print, multilingual labels and incorrect recognition. Add request limits and provider failure monitoring before public use. Scanner-to-catalogue comparison still needs exact variant/formulation matching; a matching name alone is insufficient.
4. **Finish the customer privacy and support information.** Set retention/deletion processes, a real support contact and clear processing disclosures. Keep account saving separate from optional marketing or research consent.
5. **Keep the RM10 feature paused until its payment flow is tested.** Provider callback verification, amount/bill mapping, expiry and duplicate events need a staging test before accepting payments.
6. **Run short usability sessions in Malaysia.** Test the wording and hair-shape choices with several users, including phone users. Consider Bahasa Melayu and real hair-pattern reference illustrations after checking whether the current labels are understood.

## Research provenance

The complete source URL, retailer SKU, formulation source, ingredients, price and observation date are recorded per product in `src/data/shampoos.my.json`. The catalogue contains Dove Intense Repair, Elseve Hyaluron Moisture, EverStrong Thickening, EverPure Frizz Defy, QV Gentle, three Sukin variants and two Head & Shoulders variants.

- [Watsons Malaysia: Dove Intense Repair 330 ml](https://www.watsons.com.my/dove-intense-repair-shampoo-330ml/p/BP_59799) — example of the Malaysian retailer evidence used for identity, ingredients and prices.
- [QV Malaysia: Gentle Shampoo](https://www.qvskincare.com/my/en/products/qv-gentle-shampoo.html) — manufacturer evidence for the QV formula and fragrance-free claim.
- [Alive Pharmacy: QV Gentle 250 g](https://www.alivepharmacy.com.my/product/qv-hair-gentle-shampoo-250g) — QV pack/price listing.

No retailer partnership, affiliate relationship, clinical validation or live branch stock is implied. Prices can change after the 23 September 2026 observation.

## Verification

The production build, TypeScript check and 12 matching/data tests pass. Lint reports no errors and two existing warnings for local uploaded-photo preview elements. The browser consultation was exercised through all six screens, answer review, result generation and ingredient disclosure. Refresh restored the question step. The result layout was inspected at a phone viewport. This is not a deployed integration or comprehensive accessibility audit.

Hosted Supabase, OTP email delivery, scanner-provider responses and payment processing were not exercised. Database migration/seed files have been prepared, not executed against a hosted database.
