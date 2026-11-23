# SHANERYN CMS V1.18.5 - Homepage Collection Photograph Spacing

## Why white/light bands were appearing
The Homepage Collection four-look grid forced a 2:3 CSS image frame while many uploaded studio photographs are 3:4. With `object-fit: contain`, the difference becomes blank background above and below the image. In the screenshot, three images showed these light bars, while the third (Fire & Heart) fitted the 2:3 frame.

## Fix
- Homepage four-look card images now use their **natural image aspect ratio** (`aspect-ratio: auto; height: auto`).
- Removed the pale frame color (`background: transparent`).
- Preserved uncropped, full-outfit photography (`object-fit: contain`).
- Updated desktop and mobile two-column rules together so the white bars do not return on phones.
- Existing Collection/Look Detail pages, seven-section homepage structure, `cms_users` authentication, SEO and global 100 MB uploads remain unchanged.

## Expected layout
Photographs with the same ratio remain equally tall; photographs with different ratios can be different heights. This is intentional to avoid cutting off garments. If identical heights become a stronger design priority, that requires either images prepared to one ratio or accepting some cropping; do not force fixed ratios again.

## Fire & Heart image update (included from V1.18.4)
Admin > Products & Looks > Fire & Heart > Main Photographs > Homepage four-look grid / collection card (studio photograph) > choose photo > Save & Publish. The homepage loads published Firestore product data instead of silently reverting to the original image.

## Deployment
Apply `SHANERYN_CMS_V1_18_5_NATURAL_IMAGE_HEIGHT_PATCH.zip` over **V1.18.4 only**. If still using V1.18.3 or earlier, use the complete V1.18.5 package so the Fire & Heart product image publishing fix from V1.18.4 is included. Preserve existing environment variables. Redeploy on Vercel and hard-refresh the homepage.

## Verification
- Full static/mock CMS check suite (including media, auth, SEO, product image publishing and strip regression) passed.
- Production build and browser-based visual testing against live CMS data were not performed in this environment.
