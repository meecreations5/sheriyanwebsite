import Script from 'next/script';
export const metadata={...(process.env.NEXT_PUBLIC_SITE_URL ? {metadataBase:new URL(process.env.NEXT_PUBLIC_SITE_URL)} : {}),title:{default:'SHANERYN',template:'%s | SHANERYN'},description:'SHANERYN — luxury fashion, collections and bespoke couture.',icons:{icon:'/favicon-64.png'}};
export default function RootLayout({children}){return <html lang="en" data-color-mode="inverse"><head><base href="/"/></head><body className="theme-white">{children}<Script src="/cms-menu-controller.js" strategy="beforeInteractive" /></body></html>}
