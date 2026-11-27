# SHANERYN V1.19.5 - Verified client feedback remediation

**Starting point:** V1.19.4 (Styling Service image cards).  **Runtime:** Next.js 16.4.6, plain JavaScript, Firestore + Storage service SDK, `cms_users` sessions. No Firebase Authentication. No online payments.

## Delivered in V1.19.5

1. **Reference-image uploads:** Bespoke, Contact, Appointment, Styling Services, and the legacy modal enquiry show an optional JPG/PNG/WebP picker, preview, and Remove button beside their existing look reference field. Maximum **3 MB per customer reference image** (independent of the existing 100 MB ADMIN media policy). The browser sends multipart form data only when a photo is attached. Non-image file signatures are rejected on the server.
2. **Private image handling:** The public `/api/requests` route uploads customer reference images into `private/customer-references/<requestId>/` and saves metadata with their enquiry in `cms_requests`. Only server-managed CMS users with `super_admin` or `enquiries` role can view the image via `/api/admin/requests/reference/<id>`. The CMS Enquiries/Appointment viewer shows the photo. No public download URL is generated; existing Storage rules deny browser reads to `private/` paths. A failed Firestore write triggers image cleanup.
3. **Bespoke phone:** Phone is required and client-validated for Bespoke measurement enquiries, Bespoke appointment forms, and Bespoke interests from Contact. The public API enforces phone validation so a browser cannot bypass the rule. Phone stays optional for non-Bespoke enquiries.
4. **Bespoke Other option:** `Choose your piece` adds an **Other** option, revealing a required description field directly below the garment selector. Other can be submitted without an artificial silhouette requirement; measurement units remain **inches only**.
5. **Homepage CTA:** `Explore the Looks` stays after the collection photographs and is aligned to the right.
6. **Look Details:** Heading **Details** replaces `DETAIL PHOTOGRAPHS`; desktop horizontal scrolling photos have a **30px column gap**, with a larger serif heading. On narrow screens the carousel reduces its gap to 20px to remain usable.
7. **Closing typography:** Both the homepage closing and internal collection quote use **24px pink labels** and **60px desktop white headings**, with responsive mobile scales. Existing approved wording and actions are preserved.
8. **Appointment editorial image:** The exact reference photo from slide 25 of the revised client presentation is included in the Appointment page, with a Page Manager image field `f1195-appointment-image` for later replacement.
9. **WhatsApp:** When a genuine studio WhatsApp number is configured in Global Settings, a WhatsApp contact link is available in the footer and Contact section. No phone number is invented.
10. **Founder mobile:** Additional no-break title styling and a modest photo size guard. The approved founder composition remains unchanged.

## Audit of the existing sixteen requirements

| No. | Requirement | Result in this code release |
|---|---|---|
| 1 | Upload reference image | **Implemented V1.19.5**; live Storage test pending |
| 2 | Founder mobile photograph / Designer | Existing CSS plus **additional mobile guard V1.19.5**; live visual test pending |
| 3 | Right-aligned Explore the Looks below images | **Implemented V1.19.5** |
| 4 | Upright Customization | Retained from earlier version |
| 5 | Bespoke Other | **Implemented V1.19.5** |
| 6 | Inches-only Body Measurements and Shoulder | Retained from earlier version |
| 7 | Name, email, mandatory Bespoke phone | **Implemented V1.19.5**; live request test pending |
| 8 | Three Styling Services, no Bespoke tile | Retained from V1.19.4 |
| 9 | Final Collections quote | Retained; typography refined V1.19.5 |
| 10 | Front / Back / Profile / Video | Existing gallery sequence retained; correct CMS image mapping must be reviewed for each outfit |
| 11 | Details / 30px horizontal gallery | **Implemented V1.19.5** |
| 12 | Eight consistent collection photographs | Natural-ratio, no patch bands retained; matching image proportions require content QA |
| 13 | Editable SH 001 to SH 008 | Retained from V1.19.0 |
| 14 | Appointment image and enquiry journeys | **Image added V1.19.5**, existing form retained; live Firebase submission pending |
| 15 | WhatsApp social | Conditional link present; studio must configure its official number |
| 16 | Navigation and full My Story | Retained from V1.19.2 |

Also retains the separately agreed `Homepage / Collections closing text 24px/60px` and `DETAIL PHOTOGRAPHS -> Details` revisions.

## Deployment and tests

**Small patch:** Apply to an unmodified V1.19.4 project. **Full:** Use to replace earlier codebases. Avoid applying the patch to V1.19.3 or older. No database migration and no changes to `cms_users` are required.

```bash
npm install
npm run check
npm run build
```

After deploying, smoke test: (a) submit a JPG reference from the Bespoke form; (b) confirm phone is required and the request appears in CMS Enquiries with a private photo preview; (c) submit an Appointment request and verify the photo and `requested` status; (d) switch Other garment types; (e) verify 30px Details row and mobile gallery; (f) verify founder, clothing listing and Closing; (g) configure official WhatsApp and check footer/Contact; (h) confirm unauthenticated image-GET returns 401 and that only authorised CMS staff can open the reference.

**Existing automated suite:** passes in this environment, including a multipart reference image request against an in-memory Firestore/Storage mock and bad-phone rejection. **Not verified:** Full Next.js production build (dependencies could not be installed here), Vercel deployment, genuine Firebase Storage write, and end-to-end CMS UI with production cookies.

### Important limitations

- Public customer reference uploads are intentionally **3 MB**, kept safely below common serverless request-body limits. The **CMS media upload remains 100 MB** with its existing signed/resumable path.
- Private customer images rely on Storage IAM for the server service account (read and create/delete under the existing bucket). The client Firebase Storage rules should remain unchanged and deny unauthenticated reads outside `/media`.
- The site cannot infer Front/Back/Profile correctly when the CMS photographs are not labelled or ordered; check image assignments before client sign-off.
- If client images have different proportions, natural sizing preserves full garments but does not guarantee identical card heights without cropping. Please standardise source images where a perfectly even grid is required.
