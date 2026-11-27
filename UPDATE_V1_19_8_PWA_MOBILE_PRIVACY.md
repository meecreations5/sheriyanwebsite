# SHANERYN CMS V1.19.8 — Mobile PWA, Privacy & Cookie Consent

Base: **V1.19.7**. This update does not change the approved homepage or page-section structure, catalogue schema, CMS authentication, or existing products.

## Summary

- **PWA:** Next.js App Router `app/manifest.js` with standalone display, official SHANERYN monogram icons (192px, 512px, maskable), Collections/Bespoke/Styling Services shortcuts. Public `/sw.js` and `/offline.html`; HTTPS registration and user-initiated install control, including iOS Safari home-screen instructions. No push notifications or background location permission.
- **Safe offline behaviour:** Cache only the branded offline fallback and icon. Never intercept or cache `/admin`, `/api`, `/_next` or non-navigation requests. Dynamic public catalogue pages are requested from the network each time. On a network failure, visitors see the offline message, not an outdated collection or a cached private form.
- **Cookie preferences:** The public site has Reject Optional, Preferences and Accept Analytics with equal visibility; optional Analytics is initially OFF and requires opt-in. The choice is stored locally for 180 days. Footer provides links to Privacy/Cookies/Terms and a way to change preferences. Consent UI is not shown inside CMS admin or inside Page Manager `?cmsPreview=1` iframes. These previews do not record Analytics events.
- **Actual analytics gating:** `lib/analytics-client.js` dynamically loads Firebase Analytics only after stored opt-in. Rejecting analytics does not prevent Saved Looks, requests or CMS login. Withdrawing consent disables future tracking and clears accessible first-party Analytics cookies where possible.
- **Third-party YouTube:** Look Details does not load an external YouTube iframe until the visitor presses Play. Existing Fashion Film is user-initiated as before.
- **Privacy/legal content:** Added `/privacy`, `/cookies`, `/terms` with studio-specific but **draft** language. These pages are linked for visitors but intentionally have `noindex` metadata until final approval. The studio/legal adviser needs to approve business identity, data retention schedule, responsible privacy contact and final notice wording before publication.
- **Customer forms:** Added a short privacy notice with a link to the privacy policy; does not introduce a blocking checkbox or break the existing enquiry / image upload flow.
- **Mobile:** Preserved compact header, app-style bottom nav, mobile collections, image gallery, forms and 16px text inputs. Added 320–767px responsive consent UI, bottom-tab/safe-area spacing, 44px+ actionable controls and standalone display safe-area handling for mobile notches.

## Source verification performed

`npm run check`: PASS (all existing tests plus `test-v1198-pwa-privacy-mobile.mjs`).

`npm run check:urls`: PASS.

All new JSX/JS code parsed with the TypeScript JavaScript/JSX parser (no TypeScript files were added). Service worker unit simulation verified `admin`, `api` and non-navigation requests bypass caching, while offline public navigation uses the fallback.

**Environment limitation:** The headless Chromium mobile visual run timed out. Dependency installation with `npm install --offline` failed because the npm cache lacks `@google-cloud/firestore`. Consequently the Next.js production build and true end-to-end mobile browser testing have **not** been completed in this environment.

## Live QA checklist (before production sign-off)

1. `npm install`, `npm run check`, `npm run check:urls`, `npm run build` on your workstation / CI (Node 22+).
2. Test real iPhone Safari and Android Chrome at 320/375/390/430px, plus tablet widths: homepage hero, Collections filters, Look Details photo/video, Bespoke image-card section, Styling Services, mobile menu, Contact, appointment and measurement form. Verify no horizontal scroll, cropped faces/outfits, input zoom or bottom-tab overlap.
3. Open the site in a fresh private session: verify analytics network requests and Google Analytics cookies are absent before a choice and after Reject Optional. After Accept Analytics, verify Analytics requests. Reopen Cookie Preferences from footer, switch off, and confirm collection stops on new pages.
4. Verify visible legal routes and the privacy notice on enquiry/appointment forms.
5. Check Android install (browser add-to-home-screen/installation), iOS Safari Share > Add to Home Screen, brand icon, portrait and landscape display, app relaunch, and update after redeployment.
6. Disable network: a public navigation should show branded offline fallback. CMS and API requests should **not** return cached data. Reconnect and verify current collection content appears.
7. Submit a real enquiry, Bespoke measurement request, appointment request and reference image to Firebase; verify records in CMS and no sensitive details in service-worker caches.
8. Final privacy/cookie/terms notice review with the studio's legal/compliance adviser; confirm policy contact and retention periods before public go-live.

## Important limits

- This PWA is **installable**, not an offline store; collection browsing and form submission still require an internet connection.
- No push notifications, payment gateway or account registration are added.
- Cookie consent covers currently implemented Firebase Analytics. New advertising pixels or third-party trackers must be integrated behind separate opt-in controls before being introduced.
- Changes are in the source code package only; not deployed to Vercel or Firebase.
