# SHANERYN CMS V1.13 - Vercel deployment (simple steps)

This ZIP is the same V1.13 source code, repackaged so `package.json`, `app/`, and `public/` are at the ZIP root, not inside another folder. The only new application configuration is `vercel.json`, which explicitly selects the Next.js framework. It does NOT change the public site design, CMS, Firebase security or account credentials.

## If deploying this flattened ZIP through a GitHub repository
1. Extract it into the root of your GitHub repository (or push the contents of the extracted folder, rather than adding another enclosing folder).
2. On Vercel, go to Project > Settings > Build and Deployment. Choose Framework Preset = Next.js. Set Root Directory = `./` when `package.json` is at the root. Disable the Build Command and Output Directory override switches; let Vercel use the Next.js defaults.
3. Redeploy from Deployments > Redeploy. Use the URL of the newly successful deployment (do not rely on an old preview URL).
4. If the 404 remains, open the new deployment's Build Logs and check whether you see the Next.js build command and generated routes; share those logs and your Vercel Root Directory screenshot.

## If using the original nested V1.13 source ZIP in GitHub
Keep the original source and instead set Vercel Root Directory to `SHANERYN_NextJS_Firebase_CMS`. Framework Preset must be Next.js and Output Directory override should be OFF. There is no need to replace the code for this option.

## Required / recommended Vercel environment variables
After the site is serving routes, copy all `NEXT_PUBLIC_FIREBASE_*` values from `.env.example` into Vercel Project > Settings > Environment Variables, and redeploy, including Production for the production site. Public SDK values are not admin credentials; do not add a service account JSON.

## Do not do these things
- Do not set Output Directory to `public`, `dist` or `out` for this Next.js project.
- Do not add an SPA rewrite from all routes to `/index.html`; Next.js App Router handles routes itself.
- Do not deploy the legacy static `sheriyanwebsite` directory as if it were the CMS.

Validation: package root structure and V1.13 source tests passed. A live Vercel deployment and npm install/build were NOT executed here (npm registry unavailable).
