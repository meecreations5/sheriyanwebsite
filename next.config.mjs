// Next.js application configuration. All public pages use clean App Router URLs.
// Redirects keep the original V6.9 .html bookmarks and enquiry/product query strings working.
const legacyPages = ['collections', 'collection', 'look', 'story', 'bespoke', 'film', 'testimonials', 'contact'];
const nextConfig = {
  reactStrictMode: true,
  async headers(){return [{source:'/sw.js',headers:[{key:'Cache-Control',value:'no-store, max-age=0'},{key:'Service-Worker-Allowed',value:'/'}]}]},
  async redirects() {
    return [
      {source: '/new-drop', destination: '/collections', permanent: true},
      {source: '/new-drop.html', destination: '/collections', permanent: true},
      {source: '/consultation', destination: '/bespoke#services', permanent: true},
      {source: '/consultation.html', destination: '/bespoke#services', permanent: true},
      {source: '/index.html', destination: '/', permanent: true},
      ...legacyPages.map(slug => ({source: `/${slug}.html`, destination: `/${slug}`, permanent: true}))
    ];
  }
};
export default nextConfig;
