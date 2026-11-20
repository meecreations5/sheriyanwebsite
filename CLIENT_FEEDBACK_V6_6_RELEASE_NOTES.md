# SHANERYN V6.6 — WhatsApp Mobile Tab + Social Footer
Baseline: SHANERYN V6.5 Full Website.

## Delivered
- Replace **Saved** with branded **WhatsApp** icon and label in mobile bottom navigation across every site page.
- Keep 5-tab mobile navigation: Home, Explore, Bespoke, WhatsApp, Menu.
- If official WhatsApp business number is configured, open a direct prefilled WhatsApp chat in a new tab; otherwise direct visitors to the existing working contact form. No unverified number is inserted.
- Add Instagram, Facebook, YouTube, and LinkedIn icon row below the magenta wordmark in the footer of all nine live HTML pages.
- Social links configured centrally, validated for HTTPS and matching platform host before they become clickable. Missing links stay visible but inactive.
- Saved Looks remains functional in the header, menu and collection controls, though no longer occupies a mobile dock tab.
- Existing approved inverse mode, hero, galleries, enquiry forms, content, and page layout remain unchanged.

## Owner activation steps
1. `contact-config.js`: set `window.SHANERYN_CONTACT.whatsapp` to a verified international-format WhatsApp business number.
2. `site-config.js`: add the four verified brand URLs in `social` (instagram, facebook, youtube, linkedin).
3. Re-deploy. The icon visibility remains unchanged, but the profile icons activate and WhatsApp opens the correct business conversation.

## Validation
Static and responsive checks performed against code in this ZIP; no live-site connectivity or user social URLs are assumed.
