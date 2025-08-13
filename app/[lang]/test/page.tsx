import { getDictionary, Locale } from '@/constants/i18n';

export default async function TestPage({
  params,
}: {
  params: Promise<{ lang: Locale }>;
}) {
  const { lang } = await params;
  const dictionary = await getDictionary(lang);
  return (
    <div>
      Home
      {dictionary.common.test}
      {lang}
    </div>
  );
}
