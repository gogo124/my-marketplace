# Moroccan Trip Internal Self Audit

Date: 2026-04-27

## High-Impact Issues Found

### UX
- The homepage hero search for agencies sent a `location` parameter that the agencies page did not use. This weakened search conversion.
- The hero value proposition under-explained that travel, equipment, and companion search are all available in one flow.
- Travel partner discovery lacked a city filter, which made matching overly broad and less useful.
- Travel partner cards surfaced contact but not enough structured trust context.
- Marketplace cards buried the price and seller trust behind secondary styling.

### Performance
- The homepage fetched more listing records than it displayed.
- The homepage did not surface travel-partner previews, which forced an extra navigation before users could evaluate relevance.

### SEO
- The homepage relied on layout-level metadata instead of a page-specific metadata definition.
- Shared metadata did not explicitly mark page outputs as indexable in the reusable helper.

### Conversion
- The homepage CTA hierarchy was not strict enough.
- Marketplace count visibility was too weak on both home and listings pages.
- Travel partner search was underpowered, reducing the chance of an immediate successful match.

## Highest-Impact Fixes Applied Immediately

- Fixed the homepage agencies search to submit parameters that the agencies page actually understands.
- Added a dedicated travel-companion search block to the homepage hero with destination, date, and city.
- Added live travel-partner preview cards directly below the hero.
- Replaced the homepage stat mix with live counts for:
  - available trips
  - active agencies
  - open seats
  - products for sale
- Added page-specific homepage metadata through `lib/seo.ts`.
- Extended travel-partner storage and filtering with a real `city` field.
- Improved travel-partner cards with clearer destination/date/profile-completeness trust signals.
- Improved marketplace cards with clearer price emphasis, more stable image ratio, and more visible seller trust.

## Remaining Gaps

- There is still no real phone-verification workflow in the current schema. The UI now shows honest contact-availability and verified-account signals instead of a fake "phone verified" badge.
- Homepage agency stats still derive from the agency/trip dataset rather than a dedicated aggregate helper. This is correct but could be further optimized if traffic grows.
- Travel-partner intent taxonomy is still free-text. A structured "intent" field would improve matching quality further.

## Recommended Next Internal Priorities

1. Add a proper phone-verification flow before exposing a "phone verified" trust badge.
2. Introduce saved searches and alerts for agencies, products, and travel partners.
3. Add a dedicated homepage aggregate query helper to reduce payload and database work.
4. Add richer structured data for collections such as `ItemList` on marketplace and agency directory pages.
