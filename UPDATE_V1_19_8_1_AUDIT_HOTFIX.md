# SHANERYN CMS V1.19.8.1 - Mobile/PWA Privacy Review Hotfix

Base: V1.19.8, no change to public page structure, CMS roles, catalogue schema, credentials, Firestore rules, product data, or approved photography.

## Changes
1. Cookie banner has visually equal Reject Optional and Accept Analytics primary actions (same size and style), with Preferences as the secondary full-width action. This removes the imbalance where only Accept was full-width. Optional analytics remains OFF until explicit acceptance.
2. iOS installation help now inherits the SHANERYN dark overlay theme. The previous PWA help component was a sibling of the cookie root, and CSS custom properties such as `--sh-panel` were defined only under that root; the help panel background/text therefore could be invalid.
3. Installation help now opens with keyboard focus, supports Escape, traps Tab within the modal, and adds an expanded-state announcement to the install button.
4. Broaden iPadOS detection when Safari uses desktop-style `MacIntel` user agent with touch points.
5. Added regression assertions for these gaps.

## Verification
- `npm run check`: PASS
- `npm run check:urls`: PASS
- `node --check` on browser JavaScript: PASS (where applicable)
- Production `npm run build`: NOT VERIFIED because npm install dependencies could not be fetched in this environment.
- Real-browser mobile visual QA/actual PWA install: NOT VERIFIED. Chromium headless timed out even on a static local QA preview.

## Before publishing
Run `npm install`, `npm run check`, `npm run check:urls`, and `npm run build` in CI/workstation (Node 22+); verify actual iOS/Android devices, consent analytics network gating, PWA install/launch/offline, CMS admin sign-in, and submit enquiry/reference image. Review `/privacy`, `/cookies`, `/terms` legally before turning off their draft/noindex status.
