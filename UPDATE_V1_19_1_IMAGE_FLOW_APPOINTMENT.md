# SHANERYN CMS V1.19.1 — Image Flow and Booking Visibility

Base version: V1.19.0 (final client feedback release).

## Issues confirmed from 26 November screenshots

1. Main Collections and category cards were forced into a 3:4 frame while source photos are often 2:3. This created pink/grey side bands resembling added borders. An editorial pseudo-element added a second decorative outline.
2. Quick Look appeared as a white absolute-positioned stripe over the garment photograph.
3. Look Details Front / Back / Profile photographs were forced into square tiles despite portrait source images, creating letterboxing and reducing usable photo area.
4. `/appointment` and `/styling-services` used the Contact page's hidden appointment tab but did not activate it, leaving a blank section. The Bespoke clone inherited the same hidden attribute.
5. When the appointment form is shown outside Contact, the original CSS form layout does not apply because it is scoped to `body[data-page="contact-page"]`.

## Applied corrections

- `public/shaneryn-final-v119.css`: natural image height for both collection card variants and Look Details; no forced photo frame; no decorative catalogue pseudo-outline; Quick Look moved below image; video retained as a distinct portrait tile; detailed/accessory photos use natural dimensions; desktop/mobile standalone booking layout, input styling and validation visual states restored; Bespoke keeps a dark booking treatment.
- `lib/final-feedback-v119.mjs`: remove hidden appointment state from standalone Appointment and Styling Services pages and from the Bespoke page's cloned booking section. Keep Contact page tab behaviour intact. Respect CMS section visibility settings.
- `package.json`: v1.19.1 and regression test registration.
- `tests/test-v1191-image-flow-and-booking.mjs`: new source regression covering image sizing, Quick Look position, and booking visibility.

## Verification

- `npm run check`: passed across existing and V1.19.1 tests.
- Playwright headless Chromium CSS tests (static previews, original project photos): Passed for desktop (1440px) and mobile (390px).
- Collection reference: 3:4 frame + white overlay. Corrected: photo native 2:3, transparent card background, Quick Look beneath image.
- Appointment preview: booking form visible and styled as a responsive two-column form on desktop, single column on mobile.
- Preview files are external QA assets and deliberately excluded from the deployable ZIPs.

## Deployment

Patch applies directly over V1.19.0. Replace files, then run `npm run check` and `npm run build` with project dependencies installed, followed by Vercel deployment. Verify actual Firestore-backed CMS images, form submission, and all target pages in production. No live production changes were made here.
