# SHANERYN V5.0 - Mobile App-like UI/UX

Build baseline: approved V4.9 (with the V4.8 sticky Look Detail functionality).

## Implemented

- A mobile-specific, five-destination navigation dock: Home, Explore, Bespoke, Saved, Menu.
- Compact centered original brand header, light/inverse palette switch, and full-screen editorial menu with a close action.
- Mobile-friendly overlay sheets for Saved Looks and existing modals.
- Homepage: portrait-size hero, swipe-to-change campaign images, horizontal Shop by Style cards, mobile-specific chapter spacing, full-length New Drop and Best Seller photography, and scrolling Closing Chapter cards.
- Collections: horizontally scrollable category chips, clear search/occasion controls, and two-column natural-aspect-ratio garment photography.
- Category Detail: portrait-first editorial hero and full-height look cards.
- Look Detail: swipeable gallery of five dress photos plus video preview; V4.8 sticky Request Details CTA replaces bottom navigation while active; original measurements, look-save, zoom and enquiry actions preserved.
- Bespoke: image-first tailored layout, larger touch targets and naturally stacked measurements.
- Consultation: mobile editorial service cards, full photos, touch-friendly calls to action.
- New Drop: natural-height imagery and a concise two-column look edit on mobile.
- Our Story: complete founder photograph and horizontally scrollable campaign/portfolio cards.
- Testimonials, Fashion Film, Contact: mobile-first section spacing, typography, and form controls.
- Desktop: ONLY the requested homepage carousel dot visual size reduced (5px dot inside a 24px accessible click target). Other desktop layouts remain V4.9.

## Files

New: `mobile-v5.css`, `mobile-v5.js`.
Every HTML page loads these two files after the existing V4.9 styles/scripts.

## Verified

- In-memory Chromium mobile renders: all 11 pages at 390px viewport with no JavaScript page errors or horizontal overflow in the initial view.
- Additional 320px mobile render checks: Homepage and Collections, no horizontal overflow or JavaScript page errors.
- Desktop Homepage rendered at 1440px: main layout preserved, small hero dots visible, mobile dock hidden.
- Interactive browser checks: mobile menu opens and closes; Saved Looks modal opens; Collections Pant Sets category filter gives 2 looks; Look Detail sticky mobile Request Details appears during gallery scrolling and hides when the original action is in view.
- Source checks: HTML pages, local asset paths, script syntax, stylesheet parser, ZIP integrity.

## Still pending outside V5.0

- Native iOS/Android application (not requested; this is a mobile website).
- Actual Fashion Film / garment-specific video files in place of temporary motion previews.
- Authentic testimonials, confirmed social profiles and street address, backend/CMS enquiry submission, appointment scheduling.
- Real-device Safari/Chrome and live-deployment acceptance tests before launch.

## Applying the patch

Copy the contents of the included `SHANERYN_Approved_Website/` directory over the matching folder in your **V4.9** website. For a fresh copy, use the full website ZIP instead. Do not apply the patch over older versions.
