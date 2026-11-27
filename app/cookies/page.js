import LegalShell from '@/components/LegalShell';
export const metadata={title:'Cookie Policy | SHANERYN',description:'Essential website storage and optional Firebase Analytics preferences.',robots:{index:false,follow:false},alternates:{canonical:'/cookies'}};
export default function CookiePage(){return <LegalShell eyebrow="PRIVACY SETTINGS" title="Cookies & storage">
 <p className="sh-legal-intro">We separate essential site features from optional analytics. You can reject analytics without losing access to our collections, Saved Looks or enquiry forms.</p>
 <h2>Essential storage</h2><p>The website uses local device storage to remember Saved Looks and your cookie choice. An authorised CMS login also uses a secure, HTTP-only session cookie. These features do not depend on optional Analytics consent.</p>
 <h2>Optional analytics</h2><p>If you choose to accept analytics, Firebase Analytics may place first-party analytics cookies (such as names beginning <code>_ga</code>) to understand visits and interactions. Analytics is off until you opt in. Withdrawing consent stops future collection; some browser-side analytics cookies may be removed when preferences change.</p>
 <h2>Videos and third-party websites</h2><p>External videos and social-media destinations may have their own cookies. A video loaded after you choose to play it is subject to the provider's terms. These services are separate from Firebase Analytics consent.</p>
 <h2>Change your preference</h2><p>Use the button below at any time. Your choice is stored on this device for up to 180 days, after which we may ask again.</p>
 <p><button type="button" className="sh-legal-cta" data-sh-cookie-preferences>Manage cookie preferences</button></p>
 <p className="sh-legal-updated">Draft for studio/legal review · 27 November 2026</p>
 </LegalShell>}
