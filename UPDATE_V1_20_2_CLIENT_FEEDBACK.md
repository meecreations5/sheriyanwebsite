# V1.20.2 Client Feedback Edition
- Mobile <=767px: product main photos, existing video and details photos flow vertically; existing fixed purchase CTA stays available during gallery scrolling. Existing zoom and enquiry handlers retained.
- Mobile homepage founder: vertical typography and overlapping existing photo; existing signature reused; existing colors and font families unchanged.
- Admin > Global Settings > Measurement Guide Images: desktop/mobile uploads use existing Media Library, Save & Publish persists to cms_settings/site.measurementGuide. Removing an override restores the bundled default. Desktop default retained, mobile default is supplied client image. Both Bespoke and Look Details use responsive picture and a zoomable native dialog; form state untouched.
- No new Firestore collection, rules, or migration. Existing desktop gallery and catalogue hotfix retained.
- Source regression suite, syntax checks and URL checks pass. Production build unavailable because dependencies are not installed; staging and real-device verification required.
