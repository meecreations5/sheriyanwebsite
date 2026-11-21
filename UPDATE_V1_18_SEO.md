# SHANERYN CMS V1.18 - Technical SEO baseline

Based on V1.17. **Admin login and `cms_users` are unchanged.** No approved visual design, content layout, product paths, enquiry flows or other CMS modules are redesigned.

## Added

- Consistent server-rendered metadata on public home, pages, products and curated collection routes: absolute page-specific title, meta description, canonical link, Open Graph and Twitter/X share tags, icon and index/follow directives.
- Search exclusion for hidden pages, hidden products (not in public catalog), unpopulated curated collections, and legacy generic look/collection shells. The admin remains noindex/nofollow.
- Dynamic `/sitemap.xml` which includes only visible published pages, products and populated collections. Includes CMS-created public pages. Requires `NEXT_PUBLIC_SITE_URL` to be set to your verified website origin.
- `/robots.txt` with admin/API exclusions and sitemap reference when website origin is configured.
- Baseline meta-description cleanup to remove the word `prototype` from Homepage and Collections; published CMS meta descriptions continue to take priority.
- A focused static SEO smoke test: `npm run check:seo`.

## Deployment checklist

1. Set `NEXT_PUBLIC_SITE_URL=https://YOUR-VERIFIED-LIVE-SHANERYN-DOMAIN` in production (do not include trailing paths).
2. Do not change existing Firestore, session, `cms_users`, Storage or other working configuration.
3. Build and deploy the new source; confirm `/robots.txt` and `/sitemap.xml` exist.
4. Open the homepage and at least three inner pages; inspect HTML title, description, canonical and social preview metadata.
5. Verify disabled pages/products are omitted, and no `localhost`, staging URLs or `/admin` appear in sitemap.
6. Connect Google Search Console, submit the sitemap, and monitor coverage and performance over time. A sitemap does not guarantee indexing.

## Still needs live-site verification

Indexability, Google Search Console ownership, core web vitals, image payloads and actual search performance cannot be verified from an offline source ZIP. There is no verified SHANERYN live domain in this request.
