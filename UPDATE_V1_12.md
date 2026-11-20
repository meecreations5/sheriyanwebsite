# SHANERYN CMS V1.12 — Menu / Firestore Serialization Fix

## Problem

The homepage reports `Only plain objects can be passed to Client Components from Server Components`, pointing at `components/LegacyPage.jsx` and an `updatedAt` Firebase Timestamp on one of the products. When that boundary fails, `LegacyScripts` cannot mount, so the existing website menu does not initialise correctly.

## Fix

`LegacyPage` now converts **all** data passed to `LegacyScripts` into plain props with `lib/plain-client-data.js`. Firebase Timestamp values become ISO date strings. Nested timestamps in products, galleries, collections, settings and page sections are handled. It also supports Date, Firestore GeoPoint, DocumentReference and Byte types to prevent similar errors.

The menu markup and design remain unchanged. No database or security-rule migration is needed.

## Update instructions

1. Take a backup of your current V1.11 folder.
2. Extract the V1.12 patch over V1.11 (the directory containing `package.json`).
3. In PowerShell inside that folder, stop the existing server (Ctrl+C), delete the `.next` build cache if needed (`Remove-Item -Recurse -Force .next`), then run `npm run dev`.
4. Refresh `http://localhost:3000` and test the mobile and desktop Menu buttons.
5. Run `npm run check:v112` to execute the new regression tests.

## Scope

Changes are limited to `components/LegacyPage.jsx`, a new pure helper `lib/plain-client-data.js`, `scripts/check-v112.js`, the package version/test script and this note. No page content, product data, Firebase configuration, CSS or navigation logic was changed.

## Test limits

The serializer is tested against Firestore-like timestamp objects and nested values. Browser menu handlers are tested with the baseline HTML/scripts. Live Firestore access and a full Next.js build must be verified in your local environment.
