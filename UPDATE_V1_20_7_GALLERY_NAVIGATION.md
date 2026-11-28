# V1.20.7 — Gallery, navigation and typography refinement

Base: V1.20.6. No database migration. Existing theme, founder artwork and layout, CMS/authentication, PWA, measurement fields and public URLs retained.

- Standardise semantic eyebrow/kicker/overline classes, closing quote labels and service labels at Lato Regular 400, 14px desktop / 12px mobile. Remove superseded 24px closing-label rule. Existing heading and copy typography retained.
- Product gallery native video now covers its allocated tile on all breakpoints without stretching; original control markup retained. Embedded black bars may remain and cover can crop footage. YouTube iframes fill the tile, but the provider controls its own internal fitting.
- On narrow Look Details screens, move the original footer into the existing scroll region, and the original mobile dock into the bottom layout row. Switch between dock and product panel based on the gallery boundary. Suppress dock while expanded measurement panel intersects the viewport or an overlay is active. Restore the original DOM locations on desktop. No duplicate footer or dock markup.
- Version changed assets to reduce stale browser CSS/JS.

## Verification
- `npm run check` passed (115 PASS output lines, including legacy checks and a new V1.20.7 source test). The prior 24px closing-label assertion was updated to reflect the new approved design.
- `npm run check:urls` passed. `node --check public/shaneryn-mobile-v1203.js` passed.
- Static Chromium tests: 12 seed templates at 320, 390, 1440px; checked representative computed supporting-label sizes and weights. Look Details tested video element width matching tile, computed cover and controls at all three widths. Gallery round trip, footer accordion and measurement-area dock suppression passed at both mobile widths. Static tests inline local CSS/JS and block external resources, so they do not verify loaded production fonts, images/video playback, actual Next server rendering, CMS-edited content or live form submission. Legal routes covered by source/URL checks rather than browser-rendered Next components.
- `npm run build` attempted; blocked because Next.js dependencies are not installed in this environment. Production build, live Firebase, real-device Safari/Chrome, cookie preference interaction and PWA installation remain UAT items. No live deployment performed.
