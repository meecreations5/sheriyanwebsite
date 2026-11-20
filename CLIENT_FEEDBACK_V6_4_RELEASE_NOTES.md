# SHANERYN V6.4 — Client Feedback Release Notes

**Base:** SHANERYN V6.3 full website. **Updated scope:** homepage copy, visible Bespoke measurements, Look Detail, garment enquiry categories, permanently inverse palette.

## Homepage
- Removed the Collection's “Crafted for the spotlight, cut for your body, made to be lived in all night.” sentence.
- Changed Closure main heading to **Plus-size party Wear**.
- Preserved the smaller italic Closure section label **cut for curves and made for celebration.** and the seven-section sequence.

## Bespoke
- Maintained the large/small bridal editorial photos and heading **Bespoke Couture Customization**.
- Added clear tailoring areas: **Occasion Wear**, **Bridal Wear (Men & Women)** and **Formal Corporate Wear**.
- Added a first-section **Measurement Form** deep link.
- Moved the optional measurement form immediately after the introduction (before services) and made it directly visible, not hidden in a collapsed guide.
- Added garment-specific form pathways for Occasion Wear, Bridal Wear (Women), Bridal Wear (Men) and Formal Corporate Wear, preserving existing garment/look options and unit conversion.
- Preserved the Review Measurements, Copy Summary and personal enquiry handoff; measurements are not sent automatically.

## Look Detail
- Removed the **Make it yours** panel and checkout disclaimer note.
- Changed all primary **BUY IT** CTA text to **BUY IT NOW**, including JS-rendered sticky/mobile variants. This remains an enquiry link, not payment checkout.
- Renamed the secondary Bespoke link **ENQUIRE ABOUT BESPOKE TAILORING** and retained deep-linking to the now-visible measurement form.
- Added **ENQUIRE WITH MEASUREMENTS** next to the optional Copy Measurements control. It requires at least one valid measurement and carries notes in a one-use session handoff to the contact draft. No measurements in URL or permanent local storage.
- Updated the breadcrumb label **COLLECTIONS** to **COLLECTION**.

## Global Forms & Appearance
- Added an optional garment-type dropdown to the Contact page and shared enquiry modal in active pages.
- Updated copied request text and prepared email drafts to include the garment category.
- Removed original/light-mode buttons from every full page; the approved dark/inverse palette is now forced at initial render and in the shared inverse script, regardless of prior localStorage preference.
- Retained the existing footer magenta wordmark treatment, Gallery, Collections, Founder, Past Work and other approved pages.

## Testing/limitations
- Static HTML reference validation, duplicate-ID checks, JavaScript syntax checks and archive integrity checks performed.
- A headless browser rendered the new Closure in the dark palette, but additional local page navigation/rendering was blocked by the environment. Full responsive interaction testing must be completed after deployment.
- Existing prototype email enquiries remain user-sent email drafts or clipboard summaries. No online payment or backend submission was added.
