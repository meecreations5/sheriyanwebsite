# SHANERYN V1.19.0 — Final Client Feedback Implementation

**Source:** `WEBSITE CORRECTION – 25TH NOVEMBER 2026.pptx` (27 slides; client feedback from 25 November 2026).  
**Previous source:** V1.18.17 (all-inch measurement update).  
**Framework:** Next.js 16 + plain JavaScript (JS/JSX), Firestore/Storage, existing `cms_users` authentication.  
**Production status:** Source package prepared. **Not deployed to Vercel.** Full production build and live CMS/Firestore actions require verification in the deployment environment.

## Final requirements and what changed

| Slides | Client instruction | V1.19.0 implementation |
|---|---|---|
| 2 | Founder mobile image too large; “designer” breaks | Restricted founder photograph height in mobile breakpoint; non-breaking designer title. |
| 3 | “Explore the Looks” after collection photos; improve final quote typography | Relocated homepage Collections CTA after photo grid; tuned closing headline hierarchy. |
| 4–5 | Customization upright; two ways to work with studio | Upright Customization text; separate In-Studio and Online Bespoke cards. |
| 6–8 | Accurate bespoke instructions; open-text Occasion Wear; inches notice before form | Corrected introduction, open text field for silhouette, and INCHES (in) guidance beside the form. |
| 9 | Illustrated How to Measure Yourself | Included **client-owned image** `/assets/shaneryn-how-to-measure.png` with expandable guide. |
| 10–11 | Body Measurements; no redundant Garment group; Shoulder; name/email/phone | Body measurement group standardized, Shoulder renamed, contact fields included in Bespoke submit. |
| 12–14 | Separate Styling Services; 4 service choices; Color Analysis studio only; simpler enquiry | `/styling-services` created with four choices, prominent preferred-time request, reference and requirements fields. Color Analysis studio-only enforced in UI **and on POST API**. |
| 15–16 | Two exact six-step Bespoke customer journeys and distinct CTAs | Steps and CTA labels implemented and CMS editable. Online and studio flows lead to enquiries/appointment requests, never automatic confirmed bookings. |
| 17–18 | Final three-line quote on inner collection pages; gallery 3 photos + video square; details/accessories sliders; equal catalogue sizes | New signature quote on Collections, category and Look pages; square main media; horizontal detail/accessory strips; consistent 3:4 catalogue frames. |
| 19 | Statement Outfits; Explore not Discover; Live in Luxury; hide All Occasions; Explore All Looks | Public visible labels normalized; old category ID retained. Hide occasion selector; use requested heading and standard CTA. |
| 20 | Editable SH 001–SH 008 style numbers | Exact eight client-provided numbers seeded; editable field in Products & Looks; persisted in Firestore without changing immutable product IDs/URLs. |
| 21 | WhatsApp social link | Footer link uses **only** the real number configured at `Global Settings → Contact → WhatsApp`. No number invented. |
| 22, 26 | Our Story placeholder | Preserved existing approved Our Story page; **no replacement copy provided in the deck**. |
| 23–24, 27 | Appointment section on Bespoke, styling, Contact; separate Styling Services | Added full appointment request to Bespoke; standalone `/appointment`; new service page booking; existing Contact booking revised. |
| 25 | 11-item navigation order | Responsive hamburger menu now has exact client-specified entries and valid new-page routes. |

## New CMS functionality

**Product & Looks → Details:** `Style Number (customer-facing, editable)` independent of product ID.  
**Product & Looks → Gallery & Video:** repeatable accessories with image, name, price, description, visibility and rearrangement; accessory displays on product page and Accessories index.  
**Page Manager:** new pages Styling Services, Accessories and Appointment; Bespoke journey step descriptions and buttons editable; signature quote components editable in Collections/Look pages. Existing pages and CMS published data retained.  
**Forms:** enquiry and appointment payloads are saved via existing server-side `POST /api/requests` to Firestore `cms_requests` with server validation; requests are not automatically confirmed appointments. Bespoke measurements use inches only.

## Important dependencies / client content still required

1. **Photograph order:** The first 3 uploaded product gallery photos are labelled Front / Back / Profile. Confirm that the actual file order matches those views for every look before publication. There is no reliable automated way to infer the view of each garment.
2. **Accessory inventory:** The client did not supply accessory images or prices in the deck. The UI and CMS data structure exist; accessory sections remain empty or show a polite empty state until actual items are uploaded.
3. **WhatsApp:** Enter the confirmed business WhatsApp number in Global Settings, otherwise the site does not show an invented destination.
4. **Our Story:** Slides 22/26 have no revised copy. Preserve current page until final content is supplied.
5. **Appointment requests:** User-selected dates/times are preferences, not confirmed bookable slots. Confirm the operations workflow for accepting requests after receipt.
6. **Square photo frames:** Uniform square frames use `object-fit: contain` to keep outfits fully visible; depending on source photograph aspect ratio there may be neutral padding within the square rather than a crop.

## QA performed

- `npm run check` **passed**, including all prior CMS authentication, page, upload, images, SEO, product detail, Bespoke recovery and new V1.19.0 static regression tests.
- `node --check` succeeded for modified `.js` and `.mjs` files.
- New page JSON validated, source field mappings checked; no original eight product IDs were changed.
- `npm run build` **could not run** because `next`/`node_modules` is missing in this execution environment (the prior dependency-install attempt timed out). **No successful production build is claimed.**
- Live Vercel pages, actual Firebase updates, booking submission, desktop/mobile screenshots, storage uploads, and social links are **not verified** in a deployed environment.

## Deployment

1. Back up the active project and export Firestore or keep a rollback deployment.
2. **If currently on V1.18.17**, apply the PATCH ZIP contents over the existing project root (preserve existing `.env` and Vercel secrets). For earlier versions use FULL ZIP.
3. Run `npm install` (or your locked install), then `npm run check` and `npm run build` in your own development environment.
4. Deploy to Vercel; retain existing Firebase project and `cms_users` credentials. **Do not enable Firebase Authentication or introduce a bootstrap login.**
5. Preview `/`, `/collections`, one `/collections/...` category, every `/look/...`, `/bespoke`, `/styling-services`, `/accessories`, `/appointment`, `/contact`, `/story`, and the mobile menu.
6. Log in to `/admin` and verify Style Numbers, Accessories additions, Past Work gallery, editable sections, form field configuration and publishing.
7. Submit a real test enquiry and a preferred-time request. Verify that it appears in admin as an enquiry or a **requested** appointment, and that Color Analysis cannot be submitted as online.

**Rollback:** redeploy the previous V1.18.17 build; the new product properties are additive and do not require deleting existing Firestore records.
