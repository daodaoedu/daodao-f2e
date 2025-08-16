import React from 'react';

import { Skeleton } from '@/components/ui/skeleton';
import Marquee from 'react-fast-marquee';
import Card from './Card';

const ImageCardList = ({
  title, list, direction = 'left', isLoading,
}) => {
  if (isLoading) {
    return (
      <div className="mt-5">
        <h3 className="mb-2.5 text-xl font-bold text-[#536166] max-md:flex max-md:flex-col">
          {title}
        </h3>
        <ul className="flex items-center justify-start overflow-x-scroll scroll-smooth">
          <Skeleton className="m-1 h-[150px] w-[150px] flex-none" />
          <Skeleton className="m-1 h-[150px] w-[150px] flex-none" />
          <Skeleton className="m-1 h-[150px] w-[150px] flex-none" />
          <Skeleton className="m-1 h-[150px] w-[150px] flex-none" />
          <Skeleton className="m-1 h-[150px] w-[150px] flex-none" />
          <Skeleton className="m-1 h-[150px] w-[150px] flex-none" />
          <Skeleton className="m-1 h-[150px] w-[150px] flex-none" />
          <Skeleton className="m-1 h-[150px] w-[150px] flex-none" />
          <Skeleton className="m-1 h-[150px] w-[150px] flex-none" />
        </ul>
      </div>
    );
  }
  return (
    <div className="mt-5">
      <h3 className="mb-2.5 text-xl font-bold text-[#536166] max-md:flex max-md:flex-col">
        {title}
      </h3>
      <Marquee
        gradientWidth={50}
        delay={3}
        pauseOnHover
        direction={direction}
      >
        <ul className="flex items-center justify-start overflow-x-scroll scroll-smooth">
          {list.map(
            ({
              id, caption, media_url, timestamp, permalink, like_count,
            }) => (
              <Card
                key={id}
                id={id}
                message={caption}
                date={timestamp}
                title={title}
                image={media_url}
                url={permalink}
                likeCount={like_count}
              />
            )
          )}
        </ul>
      </Marquee>
    </div>
  );
};

export default ImageCardList;
