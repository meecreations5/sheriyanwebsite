import Script from 'next/script';
import CookieConsent from '@/components/CookieConsent';
import PWAClient from '@/components/PWAClient';
import {publicSiteOrigin} from '@/lib/seo-utils';
const origin = publicSiteOrigin();
export const metadata = {
  ...(origin ? {metadataBase: new URL(origin)} : {}),
  title: {default:'SHANERYN',template:'%s | SHANERYN'},
  description: 'SHANERYN luxury fashion, collections and bespoke couture.',
  icons: {icon:'/favicon-64.png',apple:'/favicon.png'},
  applicationName:'SHANERYN',
  appleWebApp:{capable:true,title:'SHANERYN',statusBarStyle:'black-translucent'},
};
export const viewport={width:'device-width',initialScale:1,viewportFit:'cover',themeColor:'#19141d'};
export default function RootLayout({children}) {
  return <html lang="en" data-color-mode="inverse"><head><base href="/"/><link rel="stylesheet" href="/shaneryn-pwa-privacy-v1198.css"/></head><body className="theme-white">{children}<CookieConsent/><PWAClient/><Script src="/cms-menu-controller.js" strategy="beforeInteractive" /></body></html>;
}
