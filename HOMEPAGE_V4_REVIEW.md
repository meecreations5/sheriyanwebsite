# SHANERYN | Homepage V4 — Collective feedback implementation

**Version:** 2026-11-16. **Scope:** homepage section-by-section revisions. All existing inner pages are included and remain structurally unchanged, apart from connecting the approved Blaze photograph and aligning Fire & Heart's category with the supplied "gown set" name.

## How to open

Unzip and open `index.html` in a modern browser or serve the folder as a static site. No npm install is required. The site uses relative links and local images. Change between dark/inverse and original/light modes using the header icon. The existing collection, details, contact, bespoke, film, story, and testimonials pages remain in the bundle.

## New homepage sequence

1. Hero — only original logo + `Confidence! Stitched in.`; edge-to-edge desktop at 95vh; separate portrait mobile image; single image/carousel modes with autoplay in carousel.
2. The Designer & the world of SHANERYN — exact supplied letter and handwritten greeting/signature artwork, full uncropped founder portrait, "THE ART OF PERSONAL EXPRESSION", unobtrusive numbering, thin animated outline-only original SHANERYN monogram. The LinkedIn link remains pending.
3. Shop by Style — THE CURVE EDIT by SHANERYN; THE CELEBRATION COLLECTION link; approved occasion copy; eight named looks with corresponding images and category names linked to look detail pages.
4. Fashion Film — 90vh, exact supplied lines; existing muted on-scroll autoplay hook. No unrelated video is inserted in place of the yet-to-be-supplied SHANERYN YouTube ID.
5. Personalized Design — exact Made-to-Measure, Bespoke Tailoring and paragraph content, linked to Bespoke page.
6. New Drop — single, full-length picture at left; text only on right; carousel completely removed from **homepage section**; link to the New Drop page. The separate New Drop *page* itself is unchanged.
7. Best Seller — new image-led section with the exact brief text, clickable Blaze dress photograph. Blaze is an **illustrative featured selection**, not a verified sales ranking; select the actual bestseller when approved.
8. Consultation — vertical editorial treatment; color analysis, personal style consultation, occasion/party/wedding styling, and Book a Consultation link.
9. Closing Chapter — approved layout and copy untouched, with garment photos linked to their appropriate look detail pages.
10. Footer — current approved footer left as it is.

## CMS-ready content configuration

In `site-config.js`:
- `hero.mode`: `'single'` or `'carousel'`. `carousel` is the current default.
- `hero.intervalMs`: autoplay interval; default 6500 milliseconds.
- `hero.slides[]`: pair `desktop` landscape and `mobile` portrait image filenames. Both device sizes get the correct image automatically.
- `fashionFilm.youtubeId`: set to the final **approved SHANERYN YouTube video** ID. Muted autoplay starts when the section enters view and stops on leaving. Autoplay is subject to browser restrictions and connectivity.
- `founder.linkedin`: full verified https URL; until supplied the page displays a non-clickable pending label.

## Assets

- Seven newly uploaded named outfit photos were added under `assets/curated/`; existing higher-resolution look photographs are preserved and used where suitable. Blaze now has its supplied real portrait in the `assets/looks/` catalogue.
- The original logo assets were **not redesigned**. `assets/brand/shaneryn-monogram-outline.svg` is a thin traced outline of the supplied logo alpha, with no fill, used decoratively only in the founder section.
- Handwritten letter artwork (`founder-greeting.png`, `founder-signature.png`) is cut from the exact provided image and is not a replacement font or invented signature.

## Intentionally pending

- Official YouTube video ID, LinkedIn URL, social accounts and physical address are still pending. Consequently the film is a branded photographic placeholder, not a playing YouTube video yet.
- Bestseller designation, catalogue category names and garment specifications should be confirmed before publication.
- Real enquiry submissions will be added in the CMS/backend phase; current static site still prepares enquiry drafts rather than storing or sending submissions.
- Existing testimonials and past work may remain illustrative until supplied.

## Testing note

JS syntax, all local image/file references, internal links, section order and static structural requirements were checked. Browser-rendered visual QA is limited in this execution environment; conduct a final browser review of all responsive states before production deployment.
