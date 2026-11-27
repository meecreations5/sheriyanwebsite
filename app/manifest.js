// Next.js App Router PWA manifest. No notification permissions or push subscriptions.
export default function manifest() {
  return {
    id: '/',
    name: 'SHANERYN | House of Shaneryn',
    short_name: 'SHANERYN',
    description: 'Explore SHANERYN collections, bespoke couture and styling services.',
    start_url: '/', scope: '/', display: 'standalone',
    background_color: '#19141d', theme_color: '#19141d',
    icons: [
      {src: '/pwa/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any'},
      {src: '/pwa/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any'},
      {src: '/pwa/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable'},
    ],
    shortcuts: [
      {name:'Collections',short_name:'Collections',url:'/collections',icons:[{src:'/pwa/icon-192.png',sizes:'192x192'}]},
      {name:'Bespoke',short_name:'Bespoke',url:'/bespoke',icons:[{src:'/pwa/icon-192.png',sizes:'192x192'}]},
      {name:'Styling Services',short_name:'Styling',url:'/styling-services',icons:[{src:'/pwa/icon-192.png',sizes:'192x192'}]},
    ],
  };
}
