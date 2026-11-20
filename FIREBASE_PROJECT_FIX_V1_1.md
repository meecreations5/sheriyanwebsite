# SHANERYN Firebase CLI Project Selection Fix

Original CMS V1 zip was missing `.firebaserc`.

The new `.firebaserc` selects Firebase project **shanerynwesbite** by default.

1. Extract the full corrected V1.1 package, OR copy `.firebaserc` from the patch zip into the same directory as `firebase.json` in your existing CMS project.
2. Open a terminal in that directory and run `firebase login` if needed.
3. Run `firebase use` to confirm that `shanerynwesbite` is active.
4. Deploy only rules with `firebase deploy --only firestore:rules,storage --project shanerynwesbite` after reviewing their security and ensuring Firestore/Storage are enabled.

Do NOT use `firebase deploy` alone to deploy the Next.js application: included `firebase.json` configures Firestore/Storage rules and emulators only. Next.js with server-side routes needs App Hosting or suitable server-capable infrastructure. Configure Firebase App Hosting separately.

This patch does not create a Firebase project, enable billing, provision Firestore or Storage, deploy anything, or establish server-side credentials.
