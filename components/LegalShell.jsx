import Link from 'next/link';
export default function LegalShell({eyebrow,title,children}){
 return <div className="sh-legal-page"><header className="sh-legal-header"><Link href="/" aria-label="SHANERYN homepage"><img src="/assets/brand/shaneryn-wordmark-light.png" alt="SHANERYN" width="155" height="42"/></Link><nav aria-label="Site navigation"><Link href="/collections">Collections</Link><Link href="/contact">Contact</Link></nav></header>
 <main className="sh-legal-main"><p className="sh-legal-eyebrow">{eyebrow}</p><h1>{title}</h1>{children}</main>
 <footer className="sh-legal-bottom"><Link href="/privacy">Privacy</Link><Link href="/cookies">Cookies</Link><Link href="/terms">Terms</Link><button type="button" data-sh-cookie-preferences>Cookie preferences</button></footer></div>
}
