'use client';

import { Button } from '@/shared/ui';
import { Paper } from '@/shared/ui/wrapper';
import { Separator } from '@/shared/ui/separator';
import useMediaQuery from '@/shared/lib/use-media-query';
import useQueryState from '@/shared/lib/use-query-state';
import { useCircleList, circleSearchParamsSchema } from '@/entities/circle';
import { CircleCard } from './circle-card';
import { SkeletonCircleCard } from './skeleton-circle-card';

export const CircleList = () => {
  const isMedium = useMediaQuery('isMedium');
  const isLarge = useMediaQuery('isLarge');
  const [query] = useQueryState(circleSearchParamsSchema);
  const { data, isLoading, isValidating, hasMore, setSize } =
    useCircleList(query);

  const shouldShowSeparator = (index: number, totalLength: number) => {
    let columnsPerRow: number;

    if (!isMedium) columnsPerRow = 1;
    else if (!isLarge) columnsPerRow = 2;
    else columnsPerRow = 3;

    const itemsInLastRow = totalLength % columnsPerRow;
    const lastRowItems = itemsInLastRow === 0 ? columnsPerRow : itemsInLastRow;

    return index < totalLength - lastRowItems;
  };

  return (
    <>
      <Paper
        className="mb-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
        asChild
      >
        <ul>
          {!isLoading &&
            data.filter(Boolean).map((circle, index) => (
              <li key={circle._id}>
                <div className="m-0 md:m-4">
                  <CircleCard data={circle} />
                </div>
                {shouldShowSeparator(index, data.length) && (
                  <Separator
                    orientation="horizontal"
                    className="col-span-full"
                  />
                )}
              </li>
            ))}
          {(isLoading || isValidating) && (
            <>
              {['skeleton-1', 'skeleton-2', 'skeleton-3']
                .slice(0, [true, isMedium, isLarge].filter(Boolean).length)
                .map((key) => (
                  <li key={key}>
                    <div className="m-0 md:m-4">
                      <SkeletonCircleCard />
                    </div>
                  </li>
                ))}
            </>
          )}
        </ul>
      </Paper>
      {hasMore && (
        <div className="flex justify-center pb-20">
          <Button
            className="px-10"
            variant="outline"
            size="lg"
            onClick={() => setSize((prev) => prev + 1)}
          >
            顯示更多
          </Button>
        </div>
      )}
    </>
  );
};
