import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { PreferencesSettingsEditor } from '@/widgets/preferences';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('preferences_settings');
  return {
    title: t('title'),
  };
}

export default function PreferencesSettingsPage() {
  return <PreferencesSettingsEditor />;
}
