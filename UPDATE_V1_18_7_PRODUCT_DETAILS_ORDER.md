# SHANERYN CMS V1.18.7 — Product Description Placement

## Look Details Page

- Structured Fabric, Design Description, Embroidery & Detailing and Occasion appear **before Colour Story**, followed by Buy It Now / Save Look and Made to Measure.
- Existing legacy long-form description is hidden on the public page **only when at least one structured description section exists**. Its original text remains in Firestore and is editable in the CMS.
- Older products without structured descriptions continue to display their existing description.
- Empty description sections never appear. The catalogue Occasion filter stays independent.
- Desktop panels open by default; on mobile, optional detail panels start collapsed.
- The Colour Story border is adjusted so the reordered layout has no duplicate rule.

## Unchanged

All account authentication (`cms_users`), media uploads (100 MB), SEO, image galleries, product data, categories, enquiry buttons and measurements are retained.

## Deployment

Apply the small patch over a V1.18.6 project or use the full ZIP. Run `npm install`, `npm run check` and `npm run build` before release, then verify a product that has structured details and an older product with only a legacy description.
