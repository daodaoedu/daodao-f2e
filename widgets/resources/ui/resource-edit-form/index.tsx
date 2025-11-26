'use client';

import dynamic from 'next/dynamic';
import { Background, Container } from '@/shared/ui/wrapper';
import { Skeleton } from '@/shared/ui/skeleton';

const ResourceEditForm = dynamic(
  () => import('./resource-edit-form').then((mod) => mod.ResourceEditForm),
  {
    ssr: false,
    loading: () => (
      <Background>
        <Container>
          <Skeleton className="h-12 w-48 bg-basic-100" />
          <Skeleton className="mt-3 h-10 w-64 bg-basic-100" />
          <Skeleton className="mt-10 h-96 w-full bg-basic-100" />
        </Container>
      </Background>
    ),
  }
);

export { ResourceEditForm };

