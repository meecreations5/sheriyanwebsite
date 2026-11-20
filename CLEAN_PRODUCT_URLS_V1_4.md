# SHANERYN CMS V1.4 — Product URLs

- Public product pages now have clean paths, e.g. `/look/sunshine`, `/look/starlight`, `/look/fire-and-heart`. No `?id=SH-SUNSHINE` on customer-facing product URLs.
- All dynamic product cards, related looks, quick views, recently viewed links, Best Seller and admin product previews use canonical paths.
- Next.js App Router route: `app/look/[productSlug]/page.js`. Per-product title, description, Open Graph image and canonical metadata are served from the CMS.
- Previous `/look?id=SH-SUNSHINE` and `/look.html?id=SH-SUNSHINE` links redirect to `/look/sunshine`. `/look` without a product redirects to Collections.
- V1.3 Firestore `slug: sh-sunshine` is treated as a legacy SKU-based slug, so the existing 8 products do not require a Firestore migration. New custom slugs are supported in Admin → Products.
- Hidden or invalid products return 404, rather than showing a different product by mistake.
- Preserves the V6.9 design, image galleries, enquiries, mobile layout and Firebase Auth.
- To update: use the complete project ZIP or copy the changed-files ZIP over your V1.3 folder, then `npm install` (if needed) and `npm run dev`.

## URL changes

| Old | New |
|---|---|
| `/look?id=SH-SUNSHINE` | `/look/sunshine` |
| `/look?id=SH-STARLIGHT` | `/look/starlight` |
| `/look?id=SH-FIREHEART` | `/look/fire-and-heart` |
| `/look?id=SH-DAWNDUSK` | `/look/dawn-and-dusk` |
| `/look?id=SH-URASHIMA` | `/look/urashima-taro` |

## Caution

Editing a published product slug changes its URL. Keep old slug redirects if you have already published or shared those links. Set `NEXT_PUBLIC_SITE_URL` to the verified production site origin before launch so canonical URLs point at the real domain. Live deployment has not been performed.
