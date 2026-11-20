# Update SHANERYN V1.4 → V1.5

For an existing V1.4 website, use the small patch ZIP, NOT a second website folder.

1. Extract **all contents** of `SHANERYN_CMS_V1_5_Simple_Admin_Patch.zip` into the existing project folder that contains `package.json`. Allow replacement.
2. Stop any running server (`Ctrl+C`) and start again: `npm run dev`.
3. Open `http://localhost:3000/admin` and sign in with your existing Firebase email/password.
4. **Homepage images:** Page Manager → Homepage → Desktop Banner / Mobile Banner → Save & Publish.
5. **Products:** Products & Looks → Basic Details, Photos & Video, Advanced.
6. **Fashion Film:** Page Manager → Fashion Film → Upload Video or YouTube Link.
7. **New staff:** Admin Users → Username, Email, Password, Role → Create User (no UID entry).
8. Recommended security update: paste the updated `firestore.rules` into Firebase Console → Firestore → Rules → Publish.

No initial content import is required when upgrading a working V1.4 installation, and no new `gcloud` or service-account setup is needed for adding staff.

**First-ever Super Admin:** The one-time initial Firebase Auth + Firestore user authorisation from `EASY_SETUP.md` is still required before anyone can open Admin Users. Other staff can then be created entirely inside the CMS.

**Staff login:** Firebase Authentication signs in with email and password. Username is displayed within the CMS, not used as the login identifier.

**Video:** MP4/WebM upload is limited to 50 MB. YouTube accepts standard video, shorts and youtu.be links. Firebase Storage must be enabled for uploads.
