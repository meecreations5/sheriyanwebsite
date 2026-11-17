# SHANERYN Look Detail V4.5

## Approved structure implemented
- Based on the user-approved two-column Duchess Kumari image/detail architecture, retaining SHANERYN's own palette and wordmark.
- Left side on desktop: 65%-width gallery, **five full/alternate/detail photographs plus one motion-preview tile**, two media tiles per row. Full model photos render at natural aspect ratio without hard crops or fixed heights.
- Right side on desktop: 35%-width sticky, independently scrollable look-information panel with breadcrumb, look reference, story, colour, preferred size, size/measurement guidance, made-to-measure measurements, Request Details, Save Look, and product notes.
- Mobile: swipeable full-width image/video gallery with previous/next controls, followed by complete look information. No fixed-height photo cropping.
- Full-screen photo zoom with left/right navigation; video is muted, loopable and plays when visible.
- The existing saved-look browser storage, Bespoke route, and contact/enquiry routes are preserved.

## Photography mapping
- The 40 selected images come from the Google Drive **ecom** folder's `full length` and `detail` subfolders, with one five-photo selection per named look.
- `look-gallery-data.js` and `LOOK_DETAIL_SOURCE_MAP.md` contain explicit file-by-file mapping to the original names in Drive.
- Each `assets/product-detail/<slug>/motion-preview.mp4` is an **original 6-second motion study generated from supplied still photographs**, **not** an official garment film. Replace this with real garment video when supplied; do not describe it as filmed footage.

## Scope & pending
- No e-commerce cart, checkout, payment integration or prices were introduced.
- Size chips are **preferences for consultation**, not claims about available inventory.
- Measurements are optional and handled locally; they are **not stored, sent or submitted**. The Copy Measurements action lets visitors bring them to a consultation. Actual enquiry submission remains deferred to the planned CMS.
- Fabric composition, care details, production/availability, final videos and sizing information still require client verification.
- Homepage and Collections V4.4 remain unchanged in this revision.

## How to inspect
Open `index.html` and visit Collections -> any look. For best local behaviour (especially video and browser storage), serve this folder via a static HTTP server (e.g., `python -m http.server 8000`).

Direct look examples:
- `look.html?id=SH-SUNSHINE`
- `look.html?id=SH-STARLIGHT`
- `look.html?id=SH-FIREHEART`
- `look.html?id=SH-DAWNDUSK`
- `look.html?id=SH-URASHIMA`
- `look.html?id=SH-LOZEN`
- `look.html?id=SH-BELLONA`
- `look.html?id=SH-BLAZE`
