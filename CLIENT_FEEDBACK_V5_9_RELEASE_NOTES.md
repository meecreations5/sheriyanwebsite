# SHANERYN V5.9 — Consolidated Client Feedback

**Baseline:** V5.8 full website ZIP. Targeted homepage corrections only. The previous V5.8 work is preserved.

## Homepage changes

1. **Best Seller:** On screens at least 721px wide, set the section to `display:grid!important; grid-template-columns:32% 68%!important; height:auto!important; min-height:0!important` in the new `client-feedback-v59.css`. Reduce text-column padding and font size responsively so the 32% copy column remains legible. Mobile at 720px and below retains its image-first, stacked layout. Keep the exact V5.8 Starlight photograph, caption, and product-detail links unchanged.
2. **Bespoke:** Retain the original V5.7 editorial layout with a large photograph and overlapping inset, plus the monogram, supporting paragraph and Explore Bespoke CTA. Replace the primary image with the user's first uploaded bridal portrait (`assets/bespoke-bridal-primary.png`) and the inset image with the user's second uploaded fashion editorial (`assets/bespoke-bridal-secondary.png`). Both are unchanged byte copies of the uploaded PNGs. Update the heading to **Bespoke Couture _Customization_**, with *Customization* italic. The removed Bespoke quotation remains absent.
3. **Closure:** Move the exact client-approved sentence into the `<h2 id="closure-heading">` heading: **Plus-size party wear, cut for curves and made for celebration.** Remove the old subtitle/paragraph. Style the second part with an italic editorial treatment while preserving closure CTA buttons and the image-free composition.

## Preserved from previous approvals

- Homepage order: Hero → Collection → Best Seller → static Film → Founder → Bespoke → Closure.
- Full-bleed approved single-photo Hero, **Confidence! Stitched in.** headline and Explore Collections button.
- Mobile two-column Collection grid, static homepage Film image, approved Founder chapter, original Bespoke composition.
- Other services on the inner Consultation page, magenta footer branding, no descriptive lines beneath footer logo.
- Existing light/inverse modes, mobile navigation, saved looks, enquiry/forms, clickable product links and site JavaScript.
- No changes to the 10 inner-page HTML files, the look catalogue or its product content.

## Files modified or added

- `index.html`
- `client-feedback-v59.css` (new, scoped to homepage)
- `assets/bespoke-bridal-primary.png` (new; exact first upload)
- `assets/bespoke-bridal-secondary.png` (new; exact second upload)
- This release note and `CLIENT_FEEDBACK_V5_9_QA.json` (new)

## Verification performed

- Seven Chromium layout/mode combinations at 320, 390, 768, 1024 and 1440px, including light/inverse at 390 and 1440px.
- Verified desktop 32%/68% measured column widths, mobile stacking, section order, both bridal image sizes and successful decoding, exact headings and no horizontal overflow.
- Verified static home Film, Starlight image unchanged, footer copy removal maintained on all 11 pages, local referenced HTML assets present and all 15 JavaScript syntax checks passed.
- Offline interaction checks passed for colour-mode toggle, Saved Looks modal and mobile menu.
- **Limits:** Browser tested by rendering the local HTML with its assets and injecting existing scripts. Production deployment and actual-device testing were not performed. Test the published site before client acceptance.

## Deployment

- **Full ZIP:** Deploy its `sheriyanwebsite/` folder as the updated website.
- **Changed Files ZIP:** Apply over **V5.8**, maintaining the `sheriyanwebsite/` subpaths. Do not apply directly over an earlier version.
- Refresh cached CSS after deployment.
