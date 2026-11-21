import LegacyPage from '@/components/LegacyPage';
import {loadPage, loadSettings} from '@/lib/cms-data';
import {buildPublicMetadata} from '@/lib/seo-utils';
export const dynamic = 'force-dynamic';
export async function generateMetadata() {
  const [page, settings] = await Promise.all([loadPage('index'), loadSettings()]);
  return buildPublicMetadata({
    title: page?.title || 'SHANERYN',
    description: page?.description,
    canonical: '/',
    image: page?.socialImage,
    settings,
    index: Boolean(page && page.visible !== false),
  });
}
export default function Homepage() { return <LegacyPage slug="index"/>; }
