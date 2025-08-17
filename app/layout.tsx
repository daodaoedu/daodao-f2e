import { Metadata } from 'next';
import { PropsWithChildren } from 'react';
import { createMetadata } from '@/utils/metadata';
import Document from './Document';
import Providers from './Providers';

export async function generateMetadata(): Promise<Metadata> {
  // @TODO: generate feed

  return createMetadata();
}

export default async function RootLayout({ children }: PropsWithChildren) {
  return (
    <Document>
      <body>
        <Providers>{children}</Providers>
      </body>
    </Document>
  );
}
