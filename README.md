# SHANERYN | Homepage Collective Revision V4 · 16 November 2026

A cohesive 10-page **editorial fashion website prototype**, updated from the approved Midnight Gallery inverse-mode design. It remains a non-commerce site. The original SHANERYN wordmark has not been redesigned. The two-column New Drop section is now a static full-length photo and text-only link, as approved. See `HOMEPAGE_V4_REVIEW.md` for the complete section-by-section change log.

## How to review

Extract the ZIP and open `index.html` in a modern browser (or serve this folder as a static website). Use the header toggle for the original light palette or the approved inverse/dark palette. All HTML, CSS, JavaScript and fashion images are bundled in this folder. No developer installation is needed.

## Pages

| File | Purpose |
|---|---|
| `index.html` | 95vh hero with logo and tagline only, Founder, Shop by Style, 90vh Fashion Film, Personalized Design, static New Drop, Best Seller, Consultation, Closing Chapter and Footer |
| `collections.html` | Garment category image tiles including Bespoke, filters, eight named supplied looks |
| `collection.html?category=Pant%20Sets` | Individual category view |
| `look.html?id=SH-SUNSHINE` | Duchess Kumari-inspired editorial information structure, gallery, details, Save Look, Request Details and made-to-measure link |
| `story.html` | Shivani's photograph and founder story, illustrative past-work gallery, testimonials link |
| `testimonials.html` | **Clearly marked dummy content** for review of the future testimonial layout |
| `bespoke.html` | Two-mode measurement guide for five garment types and the eight named SHANERYN looks |
| `new-drop.html` | Approved two-column visual layout, with editorial carousel |
| `film.html` | YouTube player area, configured for muted on-view autoplay with a placeholder until the approved film ID is supplied |
| `contact.html` | Confirmed business email, enquiry draft, address/social placeholders and conditional Google Maps area |

## Named outfits and image status

The original high-resolution photographs are used for Sunshine, Starlight, Fire & Heart, Dawn & Dusk, Urashima Taro, Lozen and Bellona. The separately supplied real **Blaze** photograph has now been added. Seven labelled portrait variants are included in `assets/curated/`. Fire & Heart is now grouped under Gowns, matching the new supplied gown-set label.

Taglines are based on the supplied outfit naming PowerPoint; garment style notes are provisional, drawn only from the visual/presentation context. Verify fabrics, measurements, exact category names, prices (none displayed), production details and availability with the team before publishing.

## Editable configuration (ready to move into CMS)

Edit `site-config.js` to supply:
- `hero.mode`: `'single'` or `'carousel'`, default `'carousel'`. The carousel automatically advances at `hero.intervalMs` (6500 ms default).
- `hero.slides`: separate desktop landscape and mobile portrait images per slide; source images can be replaced independently.
- `fashionFilm.youtubeId`: the **11-character ID of the approved SHANERYN YouTube video**. The player is activated muted on entering view and removed/stopped when it leaves. Browsers can limit autoplay when videos cannot be muted or embedded, and the page requires internet access to load YouTube.
- `founder.linkedin`: Shivani's official profile URL.
- `social`: official profile links (Instagram, Facebook, Pinterest and YouTube).
- `studioAddress`: confirmed address; Google Maps embedding is then enabled on the contact page. The placeholder does **not** fabricate a location.

`contact-config.js` already contains the email **info@shenerian.com**, exactly as supplied by the user. The current form prepares an email draft or copyable text; it does not send or store submissions. A CMS/backend, consent and spam protection should be connected before launch. Measurements entered in Bespoke remain in the page only and are not transmitted or stored.

## Placeholder policy / content to replace

1. Dedicated category banners and their final names are still awaiting approval; the current category tiles reuse supplied outfit/editorial assets. The homepage Shop by Style section has all eight named looks and their supplied category labels.
2. Founder LinkedIn URL, social links and studio address were not supplied; the page visibly indicates pending information.
3. Past-work gallery uses supplied look photographs as a **sample arrangement**, not as evidence of previous client commissions.
4. Testimonials are labelled demonstration text, **not real clients or verified reviews**.
5. YouTube video URL was not supplied; autoplay behavior is ready, but no unrelated brand film is passed off as a SHANERYN production.
6. The enquiry CMS is not connected. There is no checkout, payment or cart.

## Notes for developers

- All pages are static HTML/CSS/JS with relative URLs.
- `look-data.js` defines the named look catalogue and outfit-specific measurement groups from `Book_mesurement.pdf`.
- `site.js` owns global header/nav, hero, wishlist, home film and legacy modals.
- `editorial-pages.js` and `feedback-v3.js` populate detail pages and interactive measurement elements.
- `collective-v3.css` contains the revision-specific styling overrides.
- `new-drop.js` retains a carousel for the **separate New Drop detail page only**; the homepage section has no carousel, arrows, or secondary image.
- LocalStorage persists dark/light and saved looks only; no personal measurements are persisted.
- This ZIP has **not been deployed**. Replace placeholders and do production SEO/accessibility/security checks before public launch.


## Homepage V4.2 - targeted revision (Nov 17, 2026)
- The **New Drop** and **Best Seller** sections now grow with their full-length garments, never lock to viewport height. Their desktop two-column editorial arrangements remain intact, and their mobile images retain natural proportions.
- **Your Story. Beautifully Worn.** now has three portrait cards matching the approved Shop by Style inset borders, gradient, typography, and arrow links. Its three looks (Bellona, Lozen, Dawn & Dusk) do not duplicate the four Shop by Style looks (Starlight, Fire & Heart, Blaze, Sunshine). Urashima Taro remains browsable on the Collections page.
- The Fashion Film section remains 90vh. Until the official video is supplied, a silent 12-second **motion preview built from SHANERYN's own editorial photographs** autoplays when the section enters the viewport, pauses when it leaves, and displays manual play if autoplay is restricted. It is NOT the final official film. To use the actual film, set `window.SHANERYN_SITE_CONFIG.fashionFilm.youtubeId` in `site-config.js` to its 11-character YouTube ID. Scroll autoplay uses muted inline playback and pauses when out of view.
- The other pages and approved design sections are unchanged.


## Homepage V4.3 (Drive photography)

See `V4_3_IMAGE_MAPPING.md` for verified image-to-outfit mappings, updated homepage sections and the Bellona fallback. All other pages and styles are carried forward from V4.2.

## V4.5 Look Detail (latest)
Five original look-specific photographs and a playable, clearly-labelled motion study per look, shown as a 2-column desktop gallery or swipeable mobile gallery. Desktop details pane is sticky; saved looks and enquiry links are retained. See LOOK_DETAIL_V4_5_NOTES.md and LOOK_DETAIL_SOURCE_MAP.md. Official garment video, final specs and CMS enquiry backend remain pending.

## V4.6 — Consultation page

The dedicated `consultation.html` page now includes the three approved services: Color Analysis, Personal Style Consultation, and Occasion Styling. It is linked from desktop/mobile navigation, the site footer, and the homepage Book a Consultation CTA. All links into Contact carry the selected consultation interest; as in previous releases, the form prepares a draft and does **not** make an appointment or submit to a backend. Two palette modes and responsive layouts are retained. See `CONSULTATION_V4_6_NOTES.md`.

## V4.8 — Desktop UX correction and smart sticky Look Detail (18 November 2026)

This release preserves the approved V4.7 visual design, image proportions, existing catalogue, pages and both colour modes. The changes below focus on usability, without creating a checkout or submitting an enquiry.

- Look Detail: Added a **compact sticky summary** which appears after the original Request Details button scrolls above the header. It keeps the look name, colour description, preferred size, Save Look and Request Details available while visitors browse the gallery. It releases at the end of the product section. There is **no nested sidebar scrollbar**.
- Mobile Look Detail: Added a discreet bottom Request Details bar, shown while the visitor is browsing a look **and the original Request Details button is not in view**. This is a functional improvement only, not the full app-style mobile redesign planned for Phase 2.
- Look Detail CTA: Moved the existing request action higher, above the optional Made to Measure fields.
- Look measurements: Inches/centimetres convert using 2.54 cm per inch. Inputs are preserved in memory, avoiding rounding drift from repeated unit switches.
- Bespoke: Unit conversion now preserves entered values across garment type and look selection. A fresh choice starts blank; returning to a previously selected garment restores its measurements during the current page visit.
- Request Details handoff: A click on the Look Detail request action carries the selected look, size and optionally entered measurements into the Contact email-draft form via a **temporary one-use sessionStorage entry**. It is read and removed immediately on Contact. Body measurements are never placed in query strings. No back-end submission is added. If sessionStorage is unavailable (e.g. some file:// previews), the Contact page still works but this convenience feature may not prefill.
- Saved Looks: Images and names inside the Saved Looks modal now open their correct Look Detail page.
- Collections: Disabled unavailable occasion filters; added clear-filter controls and an empty-state recovery action.
- Category Detail: Replaced an obsolete photo-approval note with customer-facing collection copy.
- Consultation: The page action reads **Request a Consultation**, since appointment scheduling has not been connected.

**Scope boundary:** The site's official fashion films, testimonial approval, final garment descriptions, studio address, social URLs and actual CMS/enquiry submissions remain pending as previously documented. The prototype does not collect payment or automatically transmit personal measurements.

**Checks completed:** All 11 HTML pages, 12 JavaScript files, local page/asset links and unique HTML IDs passed static checks; CSS/layout and key JavaScript interactions were checked with Chromium using in-memory rendering (this environment restricts localhost and file:// browser navigation). Desktop, tablet and mobile screenshots were captured for the Look Detail. Full real-server browser testing is recommended before launch.

## V4.9 Desktop UI/UX final polish

See `V4_9_RELEASE_NOTES.md` for the 11-page change log, testing notes, and deployment instructions. This release requires no backend migrations and preserves V4.8 UX functionality.


## SHANERYN V5.0 / Mobile App-like UI-UX

V5.0 adds a dedicated mobile visual experience across all 11 pages while retaining V4.9 desktop. For the complete scope, setup and limitations, read `MOBILE_V5_RELEASE_NOTES.md`.
