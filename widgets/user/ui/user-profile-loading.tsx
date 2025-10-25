'use client';

import { Skeleton } from '@/shared/ui/skeleton';

export const UserProfileLoading = () => {
  return (
    <div className="space-y-4">
      <Skeleton className="h-48 w-full" />
      <Skeleton className="h-48 w-full" />
    </div>
  );
};
