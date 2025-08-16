import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import Marquee from 'react-fast-marquee';
import Card from './Card';

const StoryCardList = ({
  title, list, direction = 'left', isLoading,
}) => {
  if (isLoading) {
    return (
      <div className="mt-5">
        <h3 className="text-xl text-[#536166] font-bold mb-2.5 max-md:flex max-md:flex-col">
          {title}
        </h3>
        <ul className="flex justify-start items-center overflow-x-scroll scroll-smooth">
          <Skeleton className="m-1 w-[150px] h-[calc(calc(150px/9)*16)] flex-[0_0_150px]" />
          <Skeleton className="m-1 w-[150px] h-[calc(calc(150px/9)*16)] flex-[0_0_150px]" />
          <Skeleton className="m-1 w-[150px] h-[calc(calc(150px/9)*16)] flex-[0_0_150px]" />
          <Skeleton className="m-1 w-[150px] h-[calc(calc(150px/9)*16)] flex-[0_0_150px]" />
          <Skeleton className="m-1 w-[150px] h-[calc(calc(150px/9)*16)] flex-[0_0_150px]" />
          <Skeleton className="m-1 w-[150px] h-[calc(calc(150px/9)*16)] flex-[0_0_150px]" />
          <Skeleton className="m-1 w-[150px] h-[calc(calc(150px/9)*16)] flex-[0_0_150px]" />
          <Skeleton className="m-1 w-[150px] h-[calc(calc(150px/9)*16)] flex-[0_0_150px]" />
          <Skeleton className="m-1 w-[150px] h-[calc(calc(150px/9)*16)] flex-[0_0_150px]" />
        </ul>
      </div>
    );
  }

  if (list.length === 0) {
    return <></>;
  }

  return (
    <div className="mt-5">
      <h3 className="text-xl text-[#536166] font-bold mb-2.5 max-md:flex max-md:flex-col">
        {title}
      </h3>
      {list.length > 4 ? (
        <Marquee
          gradientWidth={50}
          delay={3}
          pauseOnHover
          direction={direction}
        >
          <ul className="flex justify-start items-center overflow-x-scroll scroll-smooth">
            {list.map(
              ({
                id,
                caption,
                media_url,
                timestamp,
                permalink,
                like_count,
                media_type,
              }) => (
                <Card
                  key={id}
                  id={id}
                  type={media_type}
                  message={caption}
                  date={timestamp}
                  title={title}
                  media={media_url}
                  url={permalink}
                  likeCount={like_count}
                />
              )
            )}
          </ul>
        </Marquee>
      ) : (
        <ul className="flex justify-start items-center overflow-x-scroll scroll-smooth">
          {list.map(
            ({
              id,
              caption,
              media_url,
              timestamp,
              permalink,
              like_count,
              media_type,
            }) => (
              <Card
                key={id}
                id={id}
                type={media_type}
                message={caption}
                date={timestamp}
                title={title}
                media={media_url}
                url={permalink}
                likeCount={like_count}
              />
            )
          )}
        </ul>
      )}
    </div>
  );
};

export default StoryCardList;
