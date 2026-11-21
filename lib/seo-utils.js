// Public SEO helpers: no CMS login or Firestore user-account changes.
// The actual live website origin must be provided through NEXT_PUBLIC_SITE_URL.
export function publicSiteOrigin() {
  const raw = String(process.env.NEXT_PUBLIC_SITE_URL || '').trim();
  if (!raw) return '';
  try {
    const url = new URL(raw);
    if (!['https:', 'http:'].includes(url.protocol)) return '';
    return url.origin;
  } catch { return ''; }
}

export function publicMediaPath(value) {
  const url = String(value || '').trim();
  if (!url || /[<>\s]/.test(url)) return '';
  if (/^https:\/\//i.test(url)) return url;
  if (url.startsWith('/') && !url.startsWith('//')) return url;
  if (/^(assets\/|favicon)/i.test(url)) return '/' + url;
  return '';
}

export function buildPublicMetadata({title, description, canonical='/', image='', settings={}, index=true}) {
  const cleanTitle = String(title || 'SHANERYN').trim();
  const cleanDescription = String(description || settings?.seo?.defaultDescription || 'SHANERYN luxury fashion and bespoke couture.').trim();
  const cleanImage = publicMediaPath(image);
  const icon = publicMediaPath(settings?.branding?.favicon) || '/favicon-64.png';
  const cardImages = cleanImage ? [cleanImage] : [];
  return {
    title: {absolute: cleanTitle},
    description: cleanDescription,
    alternates: {canonical},
    robots: {index:Boolean(index), follow:Boolean(index)},
    icons: {icon},
    openGraph: {
      title: cleanTitle,
      description: cleanDescription,
      type: 'website',
      siteName: String(settings?.seo?.siteName || 'SHANERYN').trim(),
      url: canonical,
      images: cardImages,
    },
    twitter: {
      card: cleanImage ? 'summary_large_image' : 'summary',
      title: cleanTitle,
      description: cleanDescription,
      images: cardImages,
    },
  };
}
