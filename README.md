# SHANERYN — Editorial Treatment V3

**Start here:** Open the root `index.html`. It presents two approved-structure options with direct links to their Homepage and Collections page.

## What is included

- `Option_B_White_Gallery/` — recommended white-first fashion-editorial treatment.
- `Option_A_Signature_Blush/` — same approved architecture in the original blush-led palette.
- `previews/founder_editorial_white_v3.jpg` and `previews/founder_editorial_blush_v3.jpg` — visual art-direction mockups of Section 05 (not browser screenshots).
- `Approved_Originals/` — unchanged previously approved alternative prototypes.
- `previews/` — earlier V2 screenshots and V3 founder-section art direction.

## Implemented V3 — all in real HTML/CSS

1. Preserved the six approved Homepage sections in order and the Collections page.
2. Editorial chapter numbering: 01 Introduction, 02 Occasion Edit, 03 Personalised Design, 04 Fashion Film, 05 Founder & World of SHANERYN, 06 Closing Chapter.
3. Redesigned Section 05 with a strong **05 / THE FOUNDER & THE WORLD OF SHANERYN** chapter heading, oversized background number, art-directed photographic layering, actual brand monogram as watermark/stamp, pale linen texture, editorial quote and source-image disclaimer.
4. Added a repeatable paper-grain effect and subtle original image colour/contrast treatments **in CSS**. Supplied photographs remain unaltered.
5. Added a bespoke monogram seal, fine gallery frame lines, image captions, soft textile details, cinematic film treatment and monogram divider.
6. Kept the large central official footer wordmark and added a very faint genuine monogram behind it.
7. Applied analogous gallery treatment to the Collections hero and image cards without changing category/search/filter/like/viewer/enquiry JavaScript.
8. All files are local and can be opened from the file system; no website backend or payment gateway is present.

## Adjusting intensity / design details

- `editorial-v3.css` is the isolated styling layer. Comment out its `<link>` in a page to return to the V2 look.
- The transparent `assets/editorial-paper-grain.png` and `assets/editorial-linen.svg` are original site texture layers. Reduce their `.opacity` in the CSS if needed.
- Original wordmark: `assets/brand/shaneryn-wordmark-magenta.png`. Original monogram: `assets/brand/shaneryn-monogram.png`.
- Original photo sources have been preserved in the previously supplied V1 archive; this website uses the V2 optimized copies as `.webp`.

## Known content / production gaps

- The seven supplied SHANERYN photographs are real campaign photos, **not confirmed product catalogue items or a verified portrait of the founder**.
- The twelve look cards below the Collections hero are illustrative placeholder images/names. Replacing them requires confirmed garment photographs and names, categories, codes.
- The Fashion Film is a placeholder until the official video is supplied.
- The enquiry form is still a local copy/email-draft prototype, not a connected lead-submission backend. No ecommerce or checkout is enabled.

## Verification

- Static validation (image/CSS/JS references, homepage six-section order, correct founder caption, seven category controls, syntax) passed for both options, see `QA_REPORT_V3.json`.
- Live browser visual acceptance testing could not be completed in this runtime because the available Chromium browser blocks local navigation. Validate visuals/interactions locally in Chrome/Edge after extraction.
