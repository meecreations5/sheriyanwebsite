# SHANERYN CMS V1.18.12 - Bespoke section ordering crash

## Fixed

`lib/render-page.js` used `$(el).detach()` while reordering direct CMS sections. The project uses Cheerio, which does not provide the jQuery `.detach()` method. When CMS section order was configured, this threw `TypeError: $(...).detach is not a function` during server rendering. The Bespoke fallback could hide the failure by displaying seed content rather than the published page.

Replaced `.detach()` with Cheerio-supported `.remove()`. The existing placeholders and original section nodes are preserved and reused in the requested order.

## Unchanged

The first-admin-only `cms_users` authentication, Firestore structure, published content, Past Work extras, homepage styles, SEO and media upload settings are not changed. No Firestore migration is needed.

## Deployment

For V1.18.11, apply the patch ZIP at the project root. Build the project and redeploy to Vercel. Test `/bespoke` with custom section order, confirm additional Past Work photos load from CMS, and test `/` and `/collections`.

No production credentials are included in this package. Do not commit `.env.local` or Google service account JSON to Git.
