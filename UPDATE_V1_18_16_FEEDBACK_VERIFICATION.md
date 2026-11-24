# SHANERYN CMS V1.18.16 — 14-Point Feedback Verification & Corrections

Base: V1.18.15. This update **does not change Firestore collections, admin authentication, existing saved products or images, homepage section sequence, Bespoke layout or upload limits**.

## Confirmed corrections in V1.18.16

1. **Look Details — Measurements introductory paragraph:** Removed the paragraph beginning "Enter measurements in inches..." from the seeded page HTML and removed its obsolete CMS text field. The server also drops any legacy measurement-introduction node and the new scoped stylesheet hides stale markup as a fallback. The heading, inches-only inputs, contact fields and submission button remain.
2. **Look Details — Closing section contrast:** The approved pink/white/white three-line text was already in the CMS page. Its background used `--ep-quiet`, which is almost white in standard light mode. Replaced the section background with a deep charcoal-plum (`#241e26`), keeping the approved white headline, pink kicker and white supporting line. The CSS is scoped only to Look Details and loaded after existing page styles.
3. **Look Details — Colour Story cleanup:** The old static Colour Story HTML remained in the seed despite already being removed at server-render time. Removed it from the seed as well. The server-side `.ld-colour` removal remains for compatibility with older published HTML; no colour-story controls are presented in current CMS fields.

## Review of all 14 requested changes

| # | User requirement | Finding after code audit |
|---|---|---|
| 1 | Prices on Collections listings | Present in main and category grid renderers; uses `cms_products.price`, hides empty values, formats numeric INR and preserves explicitly formatted currencies. |
| 2 | Collections intro editable | Four dedicated Page Manager fields and server-rendered patch markers are present. Actual curated collection cards are managed separately under Collections. |
| 3 | Look hierarchy (tagline, name, category, larger price) | Present in server render and scoped CSS. |
| 4 | Fabric, Design Description, Embroidery, Occasion | Present as optional structured CMS fields and rendered before purchase actions, suppressing empty blocks. |
| 5 | Remove Colour Story | Present in server-render removal; V1.18.16 additionally removes legacy seed markup. |
| 6 | Measurements heading, inches only, no introductory description | **Fixed in V1.18.16:** paragraph removed. Heading and inches-only measurement logic already present. |
| 7 | Submit Your Measurements to studio | UI and `/api/requests` are connected; a mock-endpoint integration test confirmed `cms_requests` saving with measurement summary and invalid input rejection. Live Firestore still needs verification. |
| 8 | Discover Other Looks image sizing | Natural image ratio and `object-fit:contain`, no fixed empty frame, top-aligned cards. |
| 9 | Bespoke images borderless | Page-only stylesheet removes border, outline and shadow from the two overlap photographs. |
| 10 | Additional Past Work CMS controls | Add/reorder/visibility/remove/upload fields exist; sanitizer saves to `cms_pages/bespoke.pastWorkExtras`; original 17 photos remain in seed. |
| 11 | Upright pink homepage closing line | Existing V1.18.10 CSS forces normal font style and no transform in the relevant home closing label. |
| 12 | Look Details closing pink/white/white hierarchy | Text present, but standard theme contrast was poor. **Fixed in V1.18.16** with a deep background; confirmed by desktop and mobile offline browser checks. |
| 13 | Editable CMS content | Existing Page Manager patches, Collections showcase fields, Product editor and Past Work editor remain intact; the obsolete measurements text control was intentionally removed. |
| 14 | Desktop/mobile consistency | Existing responsive CSS retained; no approved grid or spacing structure was changed. Both 1280 px and 390 px static browser checks showed the corrected closing colours without horizontal overflow. |

## Verification run

- `npm run check`: **PASS**, including all previous CMS user/login, media, SEO, price, template, section sequencing and gallery tests.
- `tests/test-v1816-feedback-audit.mjs`: **PASS**, including mocked measurement form writes and invalid input validation.
- `node --check` on modified `.js`/`.mjs` files: **PASS**.
- Chromium static CSS inspection at 1280px and 390px: **PASS**, both output `rgb(36, 30, 38)` for the closing background, white headline and supporting text, pink kicker, no old intro paragraph and no horizontal overflow. This is an offline appearance check, **not** a screenshot of the deployed website.
- Production Next.js build: **not run**; package dependencies are not installed and the npm registry is not reachable from this environment (`EAI_AGAIN`).
- Live Vercel site and live CMS/Firestore: **not verified**; website inspection could not access the live URLs and no authentication credentials were used.

## Deploy

1. Apply the patch over **V1.18.15**, preserving relative paths, or use the complete V1.18.16 ZIP as the full source folder.
2. Run `npm install`, `npm run check`, and `npm run build` in your normal development environment.
3. Redeploy to Vercel, then check all 14 items on desktop/mobile, especially `/collections`, a real `/look/...` with structured product details, `/bespoke#past-work` and CMS Save & Publish.
4. Submit a measurement enquiry using **test-only details** and confirm it appears under CMS → Enquiries, then remove the test record if necessary.

No environment-variable or Firestore schema changes are required.
