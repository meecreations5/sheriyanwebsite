import Script from 'next/script';
import {publicSiteOrigin} from '@/lib/seo-utils';
const origin = publicSiteOrigin();
export const metadata = {
  ...(origin ? {metadataBase: new URL(origin)} : {}),
  title: {default:'SHANERYN',template:'%s | SHANERYN'},
  description: 'SHANERYN luxury fashion, collections and bespoke couture.',
  icons: {icon:'/favicon-64.png'},
};
export default function RootLayout({children}) {
  return <html lang="en" data-color-mode="inverse"><head><base href="/"/></head><body className="theme-white">{children}<Script src="/cms-menu-controller.js" strategy="beforeInteractive" /></body></html>;
}
