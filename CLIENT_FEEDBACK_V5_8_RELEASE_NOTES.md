# SHANERYN V5.8 — Consolidated Client Feedback

**Baseline:** V5.7 full website ZIP; targeted updates, not a redesign.

## Homepage
- Keep the seven-section sequence: Hero → Collection → Best Seller → Film (static) → Founder → Bespoke → Closure.
- **Best Seller:** Replace the featured image with the exact uploaded `IMG_9265.JPEG`, copied unchanged to `assets/best-seller-starlight-9265.jpg`. This photograph depicts the **Starlight** skirt set, so the Best Seller card caption, alternative text, and both links now point to `look.html?id=SH-STARLIGHT` instead of Blaze. The collection listing stays unchanged.
- **Fashion Film section:** Display one static existing photographic film poster (`assets/film/poster.jpg`), with no playing video, rotating image, video iframe, autoplay or play button on the homepage. Keep existing headings and content. The dedicated `film.html` page was not modified, apart from the shared footer copy removal.
- **Bespoke:** Keep the V5.7 original overlapping-image editorial layout. Heading now reads `Bespoke Customization`. Remove the italic quote `Some stories deserve something made just for them.` Keep the remaining description and Explore Bespoke link.
- **Closure:** Replace its paragraph with `Plus-size party wear, cut for curves and made for celebration.`
- **Footer sitewide (all 11 HTML pages):** Remove the tag line `Clothing that lives with you.` and the paragraph `Considered silhouettes. Personal expression. Your own way of being.` directly beneath the logo, while preserving logos, site navigation and contact information.

## Deliberately preserved
- Single-image Hero (`Confidence! Stitched in.` and Explore Collections), mobile 2-column Collection, Founder reference layout, Bespoke two-photo composition, homepage chapter sequence, inner-page forms and image assets, light/inverse mode, mobile menu, enquiry/saved look interactions.

## Files
- `index.html`, 10 additional `*.html` pages with shared footer adjustments, `client-feedback-v58.css`, `assets/best-seller-starlight-9265.jpg`, and this release note.

## Deployment
- Full ZIP: deploy `sheriyanwebsite/` folder.
- Changed ZIP: extract preserving `sheriyanwebsite/` subpaths over the V5.7 project root.
- Hard-refresh after deployment to load the new stylesheet and image.

## Quality checks
- Full page DOM checked at 320, 390, 768, 1024 and 1440px, including both visual modes at 390 and 1440px.
- Verified the new Best Seller image is an exact byte copy of the upload and the CTA points to Starlight.
- Verified no homepage video/iframe, no Bespoke quotation, the exact closure description and no footer tagline/description on all 11 pages.
- Verified 15 JavaScript files pass Node syntax checks and all local static image/script/stylesheet dependencies referenced by HTML exist.
- Offline Chromium injected-JavaScript smoke checks passed for saved-look modal, colour toggle and mobile menu. No detected horizontal overflow or page errors.
- **Limit:** Local HTTP/file browser navigation was blocked by the environment. Test on the deployed site and real devices before final client acceptance.
