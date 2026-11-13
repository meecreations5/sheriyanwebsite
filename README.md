# SHANERYN - Inverse Colour Edition

**Start here:** Open `index.html` at the top level. It is a visual design-review launcher for two working versions of the SHANERYN website.

## Two inverse colour treatments

| Option | Folder | Inverse mode | Original light mode |
| --- | --- | --- | --- |
| B / Recommended | `Option_B_White_Gallery` | Midnight Gallery: near-black charcoal, cool plum, ivory typography | White Gallery |
| A / Alternative | `Option_A_Signature_Blush` | Night Bloom: warmer aubergine and muted berry, ivory typography | Signature Blush |

Both versions contain a Homepage (`index.html`) and Collections (`collections.html`).

## Using colour mode

- **Inverse mode is the default.**
- The half-circle colour button on the top navigation toggles **Dark / Light**. The label describes the mode you will switch *to*.
- Your selection is saved in browser local storage (`shaneryn_color_mode_v1`) and shared by the Homepage and Collections pages on the same site origin. If storage is blocked by the browser, switching still works on the current page, but it might not persist across pages.
- Original logo artwork is never recoloured. The site swaps between the supplied `shaneryn-wordmark-light.png` and `shaneryn-wordmark-magenta.png`. Natural image colour is preserved.
- The inverse styling is separated in `inverse-mode.css` and the toggle in `inverse-mode.js`; the existing `site.css`, `typography-fix.css`, `footer-redesign.css`, `editorial-v3.css` and `site.js` are unchanged.

## Design and prototype scope

The approved six-section Homepage sequence, Collections page, seven category controls (All plus six garment categories), image interactions, local saved looks, video placeholder, inquiry prototype, layout, original fashion photography and mobile responsiveness are retained. No checkout is added.

The seven actual SHANERYN campaign photos are not confirmed product catalogue records or a founder portrait. The Collections look cards remain illustrative. Fashion film and enquiry backend remain placeholders, as in the source archive.

## Quality checks

- Verified CSS overrides and real light wordmark at desktop (1440px) and mobile (390px) sizes, both site options and both pages.
- Checked dark-to-original-and-back switching, colour contrast by inspection, page sizing, image loading, Collections category filtering, and outfit viewer modal colours.
- Generated eight dark-mode screenshots in `previews/inverse_*.jpg` for comparison.
- Browser sandbox in the QA environment disallowed direct `file://` and `localhost` navigation, so browser visual tests used self-contained equivalents of the real HTML/CSS/JS and data-inline images. Opening the actual website after extraction is recommended for final deployment acceptance.

## Approved originals

`Approved_Originals/` is retained unchanged from the uploaded archive.
