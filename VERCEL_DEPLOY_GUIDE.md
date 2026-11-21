# SHANERYN CMS V1.18 — Vercel deployment (root-ready archive)

## What this package fixes

The original full ZIP contained its Next.js app inside one top-level folder (`shaneryn-cms-seo-v118/`). When users push that extracted outer directory to a Git repository, Vercel may not auto-detect the framework and may serve an empty static output, producing Vercel's `404: NOT_FOUND` instead of the SHANERYN homepage.

This archive puts `package.json`, `app/`, `public/`, `lib/`, and `next.config.mjs` directly at the top level. It also includes `vercel.json` specifying the Next.js framework. No website route, admin authentication, CMS data or SEO functionality has been altered.

## Deployment using GitHub + Vercel

1. Extract this ZIP into a fresh, empty folder.
2. Upload/push the **contents** of that folder to your GitHub repository root. On GitHub, `package.json`, `app/`, and `vercel.json` must appear together at the root. Do not commit `.env.local` or private credentials.
3. Open Vercel > Your Project > Settings > Build and Deployment.
4. Framework Preset: **Next.js**.
5. Root Directory: **empty / repository root** (for this flat package). If you instead leave the files nested in `shaneryn-cms-seo-v118/`, set the Vercel Root Directory to exactly `shaneryn-cms-seo-v118`.
6. Build Command: use framework default (`npm run build` / `next build`). Do not set an empty build command.
7. Output Directory: **no override** (framework default). Do not set `public`, `out`, or `dist`.
8. Install Command: use framework default (`npm install`), or the command matching your repository lockfile.
9. Node.js version: **22.x** (or a supported compatible newer version).
10. Keep the existing production server-only Firestore credentials and `CMS_SESSION_SECRET` in Vercel Environment Variables. Set `NEXT_PUBLIC_SITE_URL` to your *verified* public site origin for canonical tags, sitemap and robots. Never include private keys in source control or public variables.
11. Redeploy **Production** after saving settings. Open the latest successful **Production** deployment URL from Vercel's Deployments tab. If using a custom domain, confirm that the domain is assigned to this project and latest production deployment.

## Verify after deployment

- `/` — homepage
- `/admin` — Content Studio login (existing `cms_users` records; no bootstrap)
- `/robots.txt` — SEO robots directives
- `/sitemap.xml` — dynamic sitemap
- `/collections` — collection directory
- `/story` — story page

If the browser still shows Vercel's own `404: NOT_FOUND`, inspect the actual Production deployment and Build Logs: framework, Root Directory, Output Directory and domain assignment. A branded Next.js 404 or a server error (`500`) is a different problem; check runtime logs. Do not add a catch-all SPA rewrite to a Next.js application.

## Code checks

`npm run check` passes for the V1.18 source. Build verification still needs `npm install && npm run build` with network access to install Next.js dependencies; this environment did not complete dependency installation.
