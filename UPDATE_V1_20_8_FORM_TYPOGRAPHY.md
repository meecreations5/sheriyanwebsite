# V1.20.8 — Form and typography consistency
Base: V1.20.7. No Firebase schema, authentication, submission logic, gallery or founder changes.

- Corrected zero horizontal padding in mobile-v5.css, contact-v67.css and editorial-pages.css.
- Public customer form controls use 16px Lato Regular, horizontal padding 16px desktop / 14px mobile, minimum heights 50px / 48px, textarea minimum heights 120px / 100px. Hidden controls, checkboxes, radio buttons and honeypot are excluded from the text-field reset. Uploads retain separate styling. Native date/time/select functionality retained.
- Standardised semantic supporting labels to 14px desktop / 12px mobile, Lato Regular 400, including nested text and ordinary CMS inline font overrides. Corrected legacy closure sizing; new final public stylesheet handles higher-specificity conflicts. Existing headings, palette and content retained. Legacy stylesheet links are versioned to reduce stale caching.
- Existing source regression suite: 115 PASS entries plus one new targeted regression test. Public URL check passed.
- Static Chromium computed-style checks: 12 seed page templates at 320, 390 and 1440px (36 page/viewport cases), 324 label and 312 field instances, no mismatches for asserted size, weight, family and padding properties. Includes simulated CMS-edited Collect Celebrations/Clothes to Empower and representative measurement inputs. Stylesheets in production order were inlined because navigation was blocked; images omitted, no JS or live Firebase. See qa/V1_20_8_computed_styles.json.
- Not a live Next.js test. Production build, deployed font loading, real CMS content, actual form validation/submission, upload, native picker interactions and visual UAT remain pending.
