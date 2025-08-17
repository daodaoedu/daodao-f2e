import { Metadata } from 'next';
import { I18nParams, locales } from '@/constants/i18n';
import { createMetadata } from '@/utils/metadata';
import Providers from './Providers';

export async function generateStaticParams() {
  return locales.map((language) => ({ language }));
}

export async function generateMetadata({
  params,
}: I18nParams): Promise<Metadata> {
  const { language } = await params;
  // @TODO: generate feed

  return createMetadata(language);
}

interface RootLayoutProps extends I18nParams {
  children: React.ReactNode;
}

export default async function RootLayout({
  children,
  params,
}: RootLayoutProps) {
  const { language } = await params;

  return (
    <html lang={language} className="scroll-smooth" suppressHydrationWarning>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
