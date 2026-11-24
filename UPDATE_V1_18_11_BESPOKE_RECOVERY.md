# SHANERYN CMS V1.18.11 - Bespoke Page Recovery

This update is a targeted safeguard for a server error observed on `/bespoke` after V1.18.10.

## Changes
- Additional Past Work entries are validated before being appended to the original gallery.
- A malformed optional gallery record no longer crashes the entire page; a server log identifies the error.
- If reading published CMS content fails during page metadata generation or page rendering, only the Bespoke page temporarily displays its bundled original content instead of a blank server-error page. The Firestore records are not changed or deleted.
- If Bespoke markup generation fails, the original page HTML is used as an emergency fallback. The error is logged.
- Other website pages, admin authentication, CMS publishing, existing 17 photographs and styling remain untouched.

## Production checks
1. Deploy to Vercel (preserve Production environment variables).
2. Visit `/bespoke` and `/bespoke#past-work` in an incognito window.
3. Check that the full original Past Work gallery appears and any additional saved photographs appear after it.
4. If CMS edits are not reflected or a fallback is used, open Vercel -> Logs and search for `BESPOKE_CMS_READ`, `BESPOKE_RENDER`, or `BESPOKE_PAST_WORK_GALLERY` to find the actual underlying error.
5. Check homepage and admin sign-in remain normal.

The supplied screenshot includes a Next.js server error digest, but not the server exception. This release prevents a visible blank page for the handled classes of failure; it cannot prove or fix an underlying Firestore IAM, network, or deployment error without Vercel logs.

**Rollback:** If a production build fails, restore the previously working deployment before troubleshooting.
