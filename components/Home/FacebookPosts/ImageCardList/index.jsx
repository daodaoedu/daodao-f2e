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
        <h3 className="text-xl text-[#536166] font-bold mb-2.5 max-md:flex max-md:flex-col">
          {title}
        </h3>
        <ul className="flex justify-start items-center overflow-x-scroll scroll-smooth">
          <Skeleton className="w-[150px] h-[150px] flex-none m-1" />
          <Skeleton className="w-[150px] h-[150px] flex-none m-1" />
          <Skeleton className="w-[150px] h-[150px] flex-none m-1" />
          <Skeleton className="w-[150px] h-[150px] flex-none m-1" />
          <Skeleton className="w-[150px] h-[150px] flex-none m-1" />
          <Skeleton className="w-[150px] h-[150px] flex-none m-1" />
          <Skeleton className="w-[150px] h-[150px] flex-none m-1" />
          <Skeleton className="w-[150px] h-[150px] flex-none m-1" />
          <Skeleton className="w-[150px] h-[150px] flex-none m-1" />
        </ul>
      </div>
    );
  }
  return (
    <div className="mt-5">
      <h3 className="text-xl text-[#536166] font-bold mb-2.5 max-md:flex max-md:flex-col">
        {title}
      </h3>
      <Marquee
        gradientWidth={50}
        delay={3}
        pauseOnHover
        direction={direction}
      >
        <ul className="flex justify-start items-center overflow-x-scroll scroll-smooth">
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
