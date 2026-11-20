# SHANERYN V6.0 - Final Homepage Fine Tuning

Source baseline: `SHANERYN_V5_9_Full_Website.zip`

## Changes

1. **Best Seller**: Removed the line `the pieces stealing every spotlight` completely from the homepage markup. Changed vertical content alignment from `justify-content:center` to `justify-content:flex-end` through a homepage-scoped override in `client-feedback-v60.css`. The approved 32%/68% desktop grid, existing typography, image, CTA and mobile stacking behavior remain as before.
2. **Bespoke**: Swapped the two existing photographs without adding or replacing image assets. Large photograph now uses `assets/bespoke-bridal-secondary.png` (two-model editorial). The small overlapping image uses `assets/bespoke-bridal-primary.png` (rose-pink bridal portrait). Updated alternative text accordingly. Preserved the original overlapping sizes and placement, heading `Bespoke Couture Customization`, and inner page links.

All other pages and assets are identical to the V5.9 baseline.

## Applying the patch

Extract `SHANERYN_V6_0_Changed_Files.zip` over the V5.9 website directory, preserving the `sheriyanwebsite/` folder structure. For a standalone deployment use `SHANERYN_V6_0_Full_Website.zip`. The new stylesheet is referenced after V5.9's existing CSS.

## QA

See `CLIENT_FEEDBACK_V6_0_QA.json` for exact browser checks. Validate deployed browser/device behavior before client sign-off.
