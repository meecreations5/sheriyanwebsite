# SHANERYN CMS V1.7 - Admin Module Verification and Menu Fix

Base: actual V1.5 and V1.6 ZIP archives. V1.7 changes only admin navigation/role-aware dashboard, CSS, the package version, one audit test and this report. It does not change the public website, content records, Firebase rules or user accounts.

## What existed in V1.5

The admin navigation included these 10 modules: Dashboard, Page Manager, Products & Looks, Collections (previously garment categories), Forms, Enquiries, Appointments, Media Library, Global Settings, Admin Users.

Admin Users was NOT removed from the source. It is accessible only to active profiles whose Firestore `cms_users/{firebaseAuthUid}.role` is exactly `super_admin`. The backend and Firestore security rules enforce this restriction. The first user's role cannot be assumed from their Firebase Authentication login email alone.

At screen widths <=850px, V1.5 placed navigation items in a horizontally scrolling row with no obvious affordance, so far-right items were easy to overlook. At desktop sizes, a scrollable sidebar could also put the final Admin Users item below the visible viewport.

## What V1.6 added

V1.6 separated garment **Categories** from curated **Collections**, giving the super administrator 11 modules. It preserved the V1.5 user-management module.

## Confirmed additional role-navigation bug

V1.5/V1.6 set the initial admin screen to `dashboard`, but the sidebar allowed `dashboard` only for the `super_admin`, `editor` and `viewer` roles. Accounts with role `products` or `enquiries` therefore opened on an inaccessible dashboard and got confusing/failed dashboard data requests. Dashboard quick-action links were also not filtered by role, so they could take staff to areas they were not authorised to edit.

## Changes in V1.7

- **Admin Users moved near the top** of the desktop sidebar, still visible ONLY to authorised Super Admin users.
- **Mobile/tablet dropdown navigation:** every module permitted to the signed-in user is shown in a simple selector; no hidden horizontal list. Mobile Sign out and View Website controls remain accessible.
- **Current access role is visible** on the Dashboard and in the mobile menu.
- **All allowed roles can access Dashboard.** Dashboard metrics request only resources the role may actually read, and quick actions are permission-filtered.
- **No authorisation relaxation:** account creation and users listing remain restricted to `super_admin` by Firestore rules and the application adapter.
- Fixed admin body margins and mobile CSS grid sizing. No changes to the public homepage or public site styles.

### Role-to-module visibility after fix

| Account role | Visible admin modules |
| --- | --- |
| `super_admin` | Dashboard, Admin Users, Page Manager, Products & Looks, Categories, Collections, Forms, Enquiries, Appointments, Media Library, Global Settings |
| `editor` | Dashboard, Page Manager, Products & Looks, Categories, Collections, Forms, Media Library, Global Settings |
| `products` | Dashboard, Products & Looks, Categories, Collections, Media Library |
| `enquiries` | Dashboard, Enquiries, Appointments |
| `viewer` | Dashboard, Page Manager (read access; saving remains blocked by Firestore) |

## Functionality not delivered as a dedicated module

These features were sometimes mentioned in design/planning discussions but are not standalone admin screens in V1.5 or V1.6:

- **Advanced SEO Manager:** default SEO is in Global Settings, and product/page content includes SEO fields; there is no dedicated central SEO dashboard.
- **Analytics dashboard:** not implemented as an admin module. Separate GA/Firebase instrumentation should not be confused with a working in-admin report.
- **Visual revision history and rollback:** the page write adapter saves revision records, but no admin UI displays/restores them.
- **Dedicated Testimonials manager:** the Testimonials page is handled through Page Manager, not a specialised testimonial list/moderation panel.

Do not treat these features as completed until separately implemented and tested.

## How to update

If you have **V1.6**: extract `SHANERYN_CMS_V1_7_Admin_Menu_Fix.zip` over the project folder containing `package.json`, then restart `npm run dev`.

If you are still running **V1.5**: use the COMPLETE V1.7 project instead, or apply V1.6 first and then the V1.7 patch. This patch by itself does not add V1.6's separate Categories and Collections module.

No new Firebase commands, UIDs, Auth users, credentials or rule changes are required for this navigation update.

If Admin Users still does not appear, check the footer/dashboard role label (must be **Super Admin**) and the matching `cms_users` profile in Firebase Firestore. Do not grant all staff user-creation rights merely to expose a menu button.

## Verification

- Compared actual V1.5 and V1.6 source ZIPs and verified the full navigation inventory.
- `npm run check`, `npm run check:urls`, `npm run check:cms`, `npm run check:v16` and new `npm run check:v17`: passed.
- 47 JavaScript/JSX files parsed with no syntax errors using a JS/JSX parser.
- Role-based navigation simulation passed for `super_admin`, `editor`, `products`, `enquiries`, `viewer`.
- Browser CSS smoke tests at 320px, 390px, 768px and 1440px using locally installed Chromium; no horizontal overflow in the admin navigation mock.

**Limitations:** These checks are offline. Full Next.js production build, live Firebase Auth/Firestore and end-to-end admin screen tests against a deployed instance were not performed. The browser smoke uses static representative admin HTML, not a running Next.js app.
