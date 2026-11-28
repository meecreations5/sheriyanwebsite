# V1.20.6 typography consistency and video correction
- Correct hero role, font weight, responsive size and mobile CTA.
- Expand description and supporting copy selectors, preserve decorative founder type and logo.
- Desktop native video fills its tile via the gallery stylesheet; mobile contain unchanged. Source video letterboxing may still require editing; cover may crop edges.
- Version CSS URLs for cache refresh. Next/font configuration unchanged.
- npm run check and npm run check:urls passed. Static Chromium fixtures for 12 seed templates at 1440, 390 and 320 pixels (36 cases) checked sample prose, hero, subheading and video styling using locally available actual Cormorant Garamond and Lato fonts in the test only. Not a live Next.js or CMS test. Production build blocked by missing Next.js dependencies. Verify deployed font loading, real media and layout on devices.
