import LegacyPage from '@/components/LegacyPage';
import {loadPage,loadSettings} from '@/lib/cms-data';
export const dynamic='force-dynamic';
export async function generateMetadata(){const [p,settings]=await Promise.all([loadPage('index'),loadSettings()]);return {title:p?.title||'SHANERYN',description:p?.description||settings.seo?.defaultDescription,icons:{icon:settings.branding?.favicon||'/favicon-64.png'},openGraph:{title:p?.title||'SHANERYN',description:p?.description||'',images:p?.socialImage?[p.socialImage]:[]}}}
export default function Homepage(){return <LegacyPage slug="index"/>}
