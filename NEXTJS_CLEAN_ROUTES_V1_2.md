# SHANERYN CMS V1.2 — Clean Next.js Page Routes

This is a focused compatibility fix based on CMS V1.1. No designs, content fields, products, forms, admin, Firebase configuration or Firebase rules were changed.

## Why `.html` was visible

V1.1 included a Next.js App Router dynamic page route (`app/[slug]/page.js`) that only accepted `*.html` slugs. It wrapped the V6.9 HTML markup in Next.js, so some original links also still included `.html`. It was **not** a static HTML-only website, but the address bar looked like one.

V1.2 now supports these public routes:

- `/` — Homepage
- `/collections` — Collections
- `/collection?category=Pant%20Sets` — Single collection category
- `/look?id=starlight` — Product detail
- `/story` — Our Story
- `/bespoke` — Bespoke
- `/film` — Fashion Film
- `/testimonials` — Testimonials
- `/contact` — Contact, Enquiry and Appointment
- `/admin` — Admin login

Links pointing to original paths such as `/look.html?id=starlight` or `/contact.html` are redirected permanently to the clean URL, and their query parameters remain intact. Old section anchors (`#services`) remain valid. Legacy links embedded in the original DOM/scripts are intentionally retained for backwards-compatible behavior; after navigation, the displayed URL is clean.

## Run correctly on Windows PowerShell

```powershell
cd C:\path\to\SHANERYN_NextJS_Firebase_CMS
npm install
npm run dev
```

Open `http://localhost:3000` for the public site and `http://localhost:3000/admin` for CMS admin. Do **not** use VS Code Live Server / Go Live / directly open an `.html` file.

Make sure the directory contains `package.json`, `app/`, `components/`, `lib/`, and `public/`. If the project directory consists of `.html` files like `index.html`, it is the **old V6.9 static site**, not the CMS project.

## Scope and verification

- Changed: `app/[slug]/page.js` and `next.config.mjs`.
- Firebase project `.firebaserc` from V1.1 is retained.
- This is a targeted source-level fix, not a live Firebase deployment or certified Next.js build.
- The project uses legacy page markup inside React rendering as a migration bridge; changing URLs does not convert every legacy DOM interaction into a dedicated React component.
