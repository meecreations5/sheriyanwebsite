# SHANERYN CMS V1.19.7 — Dynamic Categories, Collections and Accessory Links

**Base:** V1.19.6 Design Consistency. Use the small patch only over V1.19.6;
otherwise use the complete V1.19.7 codebase. Next.js 16, JavaScript/JSX only,
existing Firebase project `shanerynwesbite`, Firestore `cms_users` login. No
new database collections, new auth service, destructive data migration or image
replacements are introduced by this update.

## Why this update was necessary

The CMS already supported new garment categories and multiple clothing or
accessory collections. However, the public Collections JavaScript allowed only
six original category names in URL filters. Category-switch links pointed to
old `.html` routes. Seeded looks initially had a garment category *name* but no
`categoryId`, which made renames brittle. Public Collections cards could also
show an enabled collection with no visible assigned products. Independently,
accessory cross-selling links sometimes used a legacy look SKU as the URL.

## Changes

1. Public `/collections` category filters now resolve arbitrary published CMS
   category IDs or names. The original hardcoded six-name restriction is removed.
2. Every visible clothing category has a stable URL, `/category/{category-id}`.
   Category title, description, cover photograph and filtered looks come from
   the same published CMS records. Original `/collection?category=...` links
   are still supported, including existing category names.
3. Public category links in the collection grid and switcher use the immutable
   category ID. Renaming a category changes its visible title, not its URL.
4. The public render normalizes older products that were seeded with a `cat`
   name but no `categoryId`. A category rename updates only classification
   fields in affected Firestore product documents, preserving prices, imagery,
   descriptions and product URLs.
5. CMS prevents duplicate category names, reused seed IDs, invalid category
   assignments, missing clothing collections, and assigning clothing products
   to accessory collections. The new checks retain the existing role/session
   security and actionable error messages.
6. Public collection cards show enabled **clothing** collections only when at
   least one visible outfit is assigned. Empty or hidden collection URLs are
   not published. One look may still belong to multiple collections.
7. Sitemap entries include populated visible clothing-category pages. Hidden,
   empty or accessory categories are not mistakenly listed as clothing pages.
8. Admin Categories includes a View Category Page link for published entries,
   and Collections explains that visible products must be assigned before an
   edit appears on the public website.
9. Accessories remain an independent catalogue with their own categories and
   multiple collections. Links from accessories to related garments (including
   legacy look-specific accessories) now use the canonical product route. Empty
   accessory collection pages are not published.

## CMS workflow: New garment category

1. Admin → Categories → **+ Category**. Enter the garment category name,
   description and optional photograph; set visibility and Save & Publish.
2. Admin → Products & Looks → select a look → **Garment Category** → choose the
   new category → Save & Publish. Do not create a duplicate look.
3. Open Admin → Categories → **View Category Page**. The URL is
   `/category/{category-id}`. Recheck that the correct garment and category
   description are displayed.
4. Rename the category later from Admin → Categories. The public URL stays
   the same, and the original outfit's price and images should not change.

## CMS workflow: Clothing collections

1. Admin → Collections → Clothing Collections. For **The Curve Edit** and
   **The Curve Edit - Adorned**, edit the two existing hidden starter records.
2. Upload a collection cover, select existing clothing looks in the picker,
   turn on **Show this collection on the website**, then Save & Publish.
3. A product may be selected in both collections; that is one product record,
   not two copies. Its details are edited only under Products & Looks.
4. Visit `/collections` for the collection cards and
   `/collections/the-curve-edit-adorned` for the selected collection.
5. Optional homepage links: Global Settings → Featured Clothing Collections.
   Removing one collection assignment or hiding the edit does **not** hide
   its outfit in another collection or in All Looks.

## CMS workflow: Accessories

Use Accessory Categories for accessory types and Collections → Accessory
Collections for curated edits. Manage the actual product photographs, price,
visibility, related clothing looks and collection assignments under Accessories.
Accessory collection URLs remain `/accessories/collections/{id}`, category URLs
remain `/accessories/category/{id}`, and product URLs remain `/accessories/{id}`.
Existing accessories embedded inside looks are not deleted or duplicated.

## Tests performed

- `npm run check` — passed, including new ID-based category and product tests.
- `npm run check:urls` — passed.
- In-memory Firestore mock: category rename preserving price, images and
  descriptions, newly created category, seeded ID collision, duplicate name,
  two clothing collection assignments, invalid category and collection
  rejection — passed.
- Browser script execution in a deterministic Node VM: a brand-new garment
  category and an empty category display correctly — passed.
- JavaScript syntax checks on changed browser/server JavaScript files — passed.
- Existing independent accessory rendering and canonical look link tests — passed.
- Both output archives were validated after packaging.

**Still requires production testing:** `npm run build` and live Vercel/Firebase
CMS publishing. The Next.js dependency set was not available locally and an
`npm install --offline` attempt failed because a Google Cloud dependency was
not in the local npm cache. Run a normal `npm install`, `npm run check`,
`npm run check:urls` and `npm run build` in your own development environment.
Then publish a new category, rename one category, assign a look to two
collections, hide one collection, verify accessory links, and test mobile
navigation. This update was not deployed by ChatGPT.
