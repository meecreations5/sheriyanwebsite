# SHANERYN V1.19.4 - Original Styling Service Image Cards

**Apply over:** V1.19.3 (multi-collections & accessories). The small patch contains only changed/new files with their original relative paths.

## What changed

- Restored the three photograph-led, individually boxed editorial cards on the **separate `/styling-services` page**, not in Bespoke.
- Reused the exact three photographed assets from the earlier Bespoke page: `Shaneryn6838.webp` (Color Analysis), `Shaneryn6594.webp` (Personal Styling), and `Shaneryn6713.webp` (Occasion Styling). None of the assets were duplicated or replaced.
- Replaced the repetitive four text-only selection blocks and three text summaries with one clear, three-card editorial gallery. The separate Bespoke page and its in-studio/online consultation journeys remain unchanged.
- Kept each previously editable styling service title and description under its existing CMS field ID, preserving published copy changes.
- Added **15 CMS controls** (five per service): photograph, photo alt text, booking destination, booking-button text, and show/hide the entire card.
- Each photograph and booking button selects its service in the existing in-page appointment request form. CMS-customized links remain usable; with JavaScript disabled the normal in-page anchor still navigates to the form.
- Removed the **Bespoke** option from the Styling Services page's booking selector. Bespoke is still available on its own page and other approved booking flows.
- Maintained in-studio-only selection for Color Analysis; customer appointments remain requests pending studio confirmation.
- Used images at their natural proportions on both desktop and mobile: no fixed-height crop, no forced white bands. On mobile the cards stack vertically.

## Where to edit in CMS

1. Sign in to `/admin` as an authorized content editor.
2. Open **Page Manager > Styling Services > Three Image-Based Styling Services**.
3. Edit each service's **card photograph**, **photograph description**, **booking link**, **booking button label**, **title**, or **description**; toggle visibility when needed.
4. **Save & Publish**. No migration is required: existing Firestore page patches are applied to the updated seeded page fields and HTML.

## Verification

- `npm run check`: all installed regression tests passed, including the V1.19.4 card/CMS test.
- Offline desktop and mobile browser checks confirmed all three original photograph assets load at natural proportions, mobile has no horizontal overflow, and clicking Color Analysis preselects it and disables online appointment mode.
- Full and patch ZIPs checked for corruption after packaging.

### Not verified in this environment

- `npm run build` (Next.js dependencies are not installed in the sandbox; run `npm install` first in the deployment environment).
- Live Vercel rendering or a real Firebase appointment submission. These require the deployed application and credentials.

Existing user authentication (`cms_users`), product records, collections, accessories, media uploads, and Bespoke pages are unchanged.
