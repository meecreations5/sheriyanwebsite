> V1.9 note: After you create your first Super Admin using your existing Firebase Auth account, all additional staff are created directly in Admin Users with **Username, Password, Role** only. The new staff do not need an email address. Existing email-based administrator logins continue to work. Username accounts do not have email password recovery. See UPDATE_V1_9.md.

# SHANERYN CMS — Easiest Setup (Firebase Authentication)

**No `gcloud`, no service-account JSON, no special bootstrap command.** The initial Super Admin requires one-time Firebase Console authorisation; after that, staff accounts can be created directly inside the CMS without UID entry.

These steps use the Firebase Console for your existing project **`shanerynwesbite`**. Keep your administrator password private.

### 1 — Turn on email/password sign-in

Open https://console.firebase.google.com/project/shanerynwesbite/authentication/providers

In **Authentication → Sign-in method**, enable **Email/Password**, then Save.

### 2 — Add the admin account

Open https://console.firebase.google.com/project/shanerynwesbite/authentication/users

Choose **Add user**. Enter your chosen **email address** and **password**. After creation, copy that user's **UID** from the list. This is Firebase Authentication's normal email/password login; there is no separate CMS password to configure.

### 3 — Give that user CMS access

Open https://console.firebase.google.com/project/shanerynwesbite/firestore

Create your Firestore database if it does not exist. Under **Data**, create collection `cms_users` and a new document whose **Document ID is exactly the UID** copied in Step 2. Add the following four fields:

| Field | Firestore Type | Example value |
|---|---|---|
| `email` | string | the exact email from Step 2 |
| `username` | string | `superadmin` |
| `role` | string | `super_admin` |
| `active` | boolean | `true` |

**Important:** `active` must be a boolean value, not the text `"true"`. Do not put a password in Firestore.

### 4 — Secure database rules (one time)

In **Firestore Database → Rules**, replace the contents with the `firestore.rules` file provided in this project, then click **Publish**. The rules grant the CMS permissions to accounts listed in `cms_users`; other Firebase Auth accounts cannot access admin content.

If you want to upload media from the admin, open **Storage → Rules**, paste `storage.rules` and Publish. Firebase might ask you once to authorise the Storage rules to read role records from Firestore; approve the official Firebase Console prompt. You can set up media uploads later.

### 5 — Run the website

Extract the latest full V1.11 ZIP and open the folder containing `package.json` in VS Code or PowerShell:

```powershell
npm install
npm run dev
```

Open **http://localhost:3000/admin** and sign in with the **email + password from Step 2**.

Then click **Import V6.9 Baseline** on the dashboard (one time), if the website content has not yet been imported.

## Day-to-day usage

- Sign in at `/admin` using Firebase Authentication.
- Edit text, photos, products, categories, curated collections, sections, global links and forms.
- Use **Save & Publish**. No approval workflow.
- After the first Super Admin signs in, go to **Admin Users → Create User**. Enter username, password and role only. No email or UID is required for new staff.
- Password resets use Firebase Authentication's **Forgot password?** function.

## Troubleshooting

- **Original Super Admin shows Invalid username or password:** Enter the real **Firebase Authentication email** shown under Authentication → Users, not the display name `superadmin`. To reset its password, enter that email on the CMS login screen and select **Forgot password?**. Never edit a password field in `cms_users`.
- **'No CMS access':** Check `cms_users/{UID}` has the exact UID and `active` boolean `true` and `role` string `super_admin`.
- **'Missing or insufficient permissions':** Publish the provided Firestore rules; ensure you are using the project `shanerynwesbite`.
- **Admin opens but pages cannot be edited:** Firestore must be created, permissions must be published, and your UID must have access.
- **Media upload fails:** Ensure Firebase Storage is enabled and its rules are published; media uploads may require a paid plan and the official cross-service permissions prompt.

## Security and launch limitations

This is a **development build**, not a production deployment. Public enquiry submission is supported by a rules-protected Firestore create; the route also checks form content, a bot honeypot and basic process-local throttling. **That throttling is not reliable across multiple cloud instances.** Before real production traffic, enable Firebase App Check, a durable rate limiter / bot protection, Firestore backup, privacy/consent and end-to-end tests. Neither Firebase nor the website has been modified remotely by this ZIP.

Do not make Firestore rules `allow read, write: if true`. Never upload service-account private keys to the site.
