# SHANERYN CMS v1.19.3 - Multi-Collection & Independent Accessories

Base: v1.19.2 (My Story). All changes use Next.js 16 + JavaScript, the existing
Firestore project, and the current cms_users authentication/session system.
No migration, re-creation of looks, or new authentication service is required.

## What is now supported

### Clothing collections
- The existing Collections module can create as many curated clothing edits as
  needed and assign one outfit to more than one edit without duplicating it.
- Two starter entries appear in CMS: `The Curve Edit` and `The Curve Edit - Adorned`.
  Both are intentionally **hidden and unassigned** until staff select their looks,
  upload cover photography, and publish; the client did not identify which outfits
  belong to Adorned. Do not guess product assignments.
- Collection names now render as saved, not as the generic word `COLLECTION`.
- Existing clothing category filters, product style numbers, URLs and prices are
  unchanged.
- Visible clothing edits: `/collections/[collectionSlug]`.

### Independent accessories
- CMS sidebar: **Accessories** and **Accessory Categories**.
- Accessory records have name, optional SKU, price, description, main photograph,
  additional photographs, visibility, display order, category, multiple curated
  collections, related clothing looks and SEO details.
- Categories and collections are separate concepts. An accessory can be in one
  category and several curated collections, without copying the product.
- Collections CMS now has **Clothing Collections** and **Accessory Collections**
  tabs. Accessory collection assignments are saved to accessory records only.
- Public: `/accessories` displays accessory collections, categories, new products
  and older accessories previously entered under clothing looks.
- Dedicated routes:
  - `/accessories/[accessorySlug]`
  - `/accessories/collections/[collectionSlug]`
  - `/accessories/category/[categorySlug]`
- Independent accessories linked to outfits appear in the existing accessory
  strip beneath the relevant clothing look with a link to the accessory page.
- Existing look-specific accessories remain stored in the old product records.
  They are still managed in Products & Looks, not automatically duplicated as
  independent accessories. To assign them to accessory collections, first create
  an independent accessory and reuse its existing photo; the public listing
  suppresses exact name/image duplicates.
- No online checkout is introduced. Accessory pages link to a studio enquiry.

### Homepage option
- Global Settings > Homepage Highlights now includes **Featured Clothing
  Collections**. Selecting a published, populated clothing collection adds a
  restrained link within the *existing* homepage Collections chapter. The
  approved homepage section order and featured outfit photographs are unchanged.
- Nothing appears until staff make a selection.

## How to publish a new clothing collection
1. Admin > Collections > Clothing Collections > + Clothing Collection.
2. Enter its title, description and cover photo; choose garments.
3. Enable Show this collection; Save & Publish.
4. Repeat for The Curve Edit and Adorned. Use their existing starter records,
   rather than making duplicates with a new name.
5. Optional: Global Settings > Homepage Highlights > Featured Clothing
   Collections > choose collections to link from the existing home chapter.

## How to publish accessories
1. Admin > Accessory Categories > create a category (e.g. Jewellery) if needed.
2. Admin > Collections > Accessory Collections > create a curated edit.
3. Admin > Accessories > + New Accessory > enter the item, price and photographs;
   choose category, select accessory collections, and optionally link looks.
4. Save & Publish; confirm the accessory detail page, category page and curated
   collection page. One accessory may appear in multiple edits.
5. To hide a record without deleting it, uncheck Show on website and publish.

## Data and security
- Reuses `cms_products`, `cms_categories`, `cms_curated_collections`.
- Adds `cms_accessories` and `cms_accessory_categories`.
- `cms_curated_collections.type` is `clothing` or `accessories`. Older records
  without a type are treated as clothing automatically.
- New records are written only through existing authenticated Next.js CMS API.
- The included `firestore.rules` adds **read-only public** permissions to the
  new accessory collections. Admins and visitors still cannot write via browser
  Firestore SDK. `cms_users`, sessions and `cms_requests` remain private.
- If the deployment relies on public Web SDK fallback, deploy updated Firestore
  rules separately; Vercel deployment alone does not publish Firebase rules.
- No destructive migration or auto-copy of legacy accessories.
- Existing media upload limits and signed upload flows are unchanged.

## Verification performed
- `npm run check`: legacy suite and both new catalogue tests passed.
- `npm run check:urls`: passed.
- In-memory Firestore API tests: accessory CRUD, categories, multi-collection
  membership, separation from clothing collections, source product preservation,
  legacy type handling, role isolation, featured homepage settings.
- Server catalogue render tests: separate collection and category filters,
  hidden accessory exclusion, legacy gallery coexistence, SEO-safe URLs,
  title and price formatting, linked garments and HTML escaping.
- Admin JSX syntax parsing with the installed TypeScript parser passed.

## Still requiring a real deployment test
- Production `npm run build` with installed dependencies. Package installation
  was not available in this environment.
- Firestore rules deployment (if public SDK fallback is used), actual database
  reads/writes, large media uploads, full user booking flows, mobile browser
  checks, and Vercel production appearance.
- Staff must choose which garments belong to Adorned, provide accessory
  photographs/prices, and publish actual category/collection records.
