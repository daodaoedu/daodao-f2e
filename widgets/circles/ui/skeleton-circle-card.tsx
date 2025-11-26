import { MapPin } from 'lucide-react';
import { AspectRatio } from '@/shared/ui/aspect-ratio';
import { Separator } from '@/shared/ui/separator';
import { Skeleton } from '@/shared/ui/skeleton';

export const SkeletonCircleCard = () => {
  return (
    <div className="p-2">
      <AspectRatio ratio={2 / 1} className="overflow-hidden rounded">
        <Skeleton className="h-full w-full" />
      </AspectRatio>
      <div className="space-y-2.5 p-2.5">
        <Skeleton className="h-6 w-full" />
        <div className="space-y-1 text-xs">
          <div className="flex h-3 items-center gap-1.5">
            <h3>學習領域</h3>
            <Separator orientation="vertical" className="bg-basic-500" />
            <Skeleton className="h-3 w-16" />
          </div>
          <div className="flex h-3 items-center gap-1.5">
            <h3>適合階段</h3>
            <Separator orientation="vertical" className="bg-basic-500" />
            <Skeleton className="h-3 w-16" />
          </div>
        </div>
        <div className="body-sm line-clamp-2 h-10 space-y-2">
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-5 w-1/2" />
        </div>
        <div className="flex items-center gap-1 text-xs">
          <MapPin size={16} className="text-basic-400" />
          <Skeleton className="h-4 w-6" />
        </div>
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-6 w-16" />
        </div>
      </div>
    </div>
  );
};

