# V1.20.3 — Mobile gallery and founder correction

- Replaced the V1.20.2 window-scroll CTA handler with a dedicated mobile viewport: fixed header, independently scrolling middle region, and a stationary bottom product-information/purchase panel in separate grid rows. Existing live DOM nodes are moved, not cloned, including related looks, video, optional details and the measurement form. Desktop DOM order is restored above 767px. Gallery sub-navigation is retained inside the scrolling region. The bottom global tab bar is hidden on immersive mobile look pages.
- Mobile Buy it now opens the existing inline inches-only measurement form when valid fields exist; otherwise it retains the original enquiry link. Existing inline enquiry actions remain available. No new checkout or shopping-cart system.
- Homepage founder uses a separate mobile 2:3 editorial composition: full-height vertical typography, a 54%-width overlapping portrait with a thin frame, original signature and CMS caption. Uses existing theme, title font and title colour, no new palette or image filters. Desktop founder markup remains unchanged.
- Responsive desktop/mobile chart uploads and V1.20.2 guide viewer are preserved unchanged. No Firebase schema/rules change.

## Verification
- Existing source regression suite and added V1.20.3 structural tests.
- Chromium fixture built from seed markup, local source CSS/JS and bundled assets at 390x844: verified middle region scrolls while header and bottom panel coordinates remain fixed; Related Looks is inside the middle region; Buy it now opens the inline form; resizing restores desktop direct-child order. Founder cover rendered with actual bundled photo/signature. This was a seed/static fixture, not a live Next.js/CMS site. Local HTTP navigation was blocked, so the test used inline assets. The browser test process did not exit cleanly within the time limit; the listed assertions printed PASS before timeout. Screenshots were captured after dismissing the intro in a separate run.
- Production build, live Firebase integration and physical iPhone/Android/PWA UAT remain pending. Deploy to staging first.
