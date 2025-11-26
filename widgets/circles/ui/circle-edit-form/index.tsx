'use client';

import dynamic from 'next/dynamic';
import { Background, Container } from '@/shared/ui/wrapper';
import { Skeleton } from '@/shared/ui/skeleton';

const CircleEditForm = dynamic(
  () => import('./circle-edit-form').then((mod) => mod.CircleEditForm),
  {
    ssr: false,
    loading: () => (
      <Background className="min-h-screen text-basic-400">
        <Container className="max-w-3xl space-y-6 pb-12">
          <Skeleton className="h-12 w-48 bg-basic-100" />
          <Skeleton className="h-96 w-full bg-basic-100" />
        </Container>
      </Background>
    ),
  }
);

export { CircleEditForm };
