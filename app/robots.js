import {publicSiteOrigin} from '@/lib/seo-utils';
export default function robots() {
  const origin = publicSiteOrigin();
  return {
    rules: [{
      userAgent: '*',
      allow: '/',
      disallow: ['/admin', '/api/', '/cms-seed/'],
    }],
    ...(origin ? {sitemap: origin + '/sitemap.xml', host: origin} : {}),
  };
}
