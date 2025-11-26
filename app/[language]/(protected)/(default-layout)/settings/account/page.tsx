import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { AccountSettingsEditor } from '@/widgets/account';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('account_settings');
  return {
    title: t('title'),
  };
}

export default function AccountSettingsPage() {
  return <AccountSettingsEditor />;
}
