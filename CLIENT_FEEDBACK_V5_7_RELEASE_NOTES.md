# SHANERYN V5.7 — Homepage Bespoke Restoration

Baseline: SHANERYN V5.6 Full Website.

- Keep homepage chapter order: Hero → Collection → Best Seller → Fashion Film → Founder → Bespoke → Closure.
- Remove all three-card Services markup and its mobile swipe carousel from the homepage.
- Bring back the original homepage Bespoke editorial layout: overlapping tailoring photos (`visual_08.jpg`, `visual_10.jpg`), official monogram, image-first split composition, editorial typography and single Explore Bespoke CTA.
- Text is aligned to the client-provided original section design reference: "Made Around Your Moments." and the personalised design description, without an additional "by SHANERYN" heading.
- Preserve the dedicated `bespoke.html` page. The remaining services are already on `consultation.html`: Colour Analysis (`#color-analysis`), Personal Style Consultation (`#personal-style`) and Occasion Styling (`#occasion-styling`). Existing header, mobile menu and footer navigation still links to Consultation.
- No changes to the approved Hero, Collection, Best Seller, Film, Founder, Closure, logo, scripts, or existing other pages.
- New page-specific file: `client-feedback-v57.css`, loaded last to restore the two-photo composition and responsive styling without altering the rest of the site.

Deployment:
- Full ZIP: replace full `sheriyanwebsite` folder.
- Changed ZIP: extract into V5.6 root, preserving `sheriyanwebsite/` paths.
- Hard-refresh after deploying new stylesheet.
