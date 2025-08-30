import { getDictionary, I18nParams } from '@/constants/i18n';

export default async function Page({ params }: I18nParams) {
  const { language } = await params;
  const dict = await getDictionary(language);
  return <div>{dict.common.title}</div>;
}
