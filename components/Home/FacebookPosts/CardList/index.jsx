import React from 'react';

import { Skeleton } from '@/components/ui/skeleton';
import Marquee from 'react-fast-marquee';
import Card from './Card';

const CardList = ({
  title, list, direction = 'left', isLoading,
}) => {
  if (isLoading) {
    return (
      <div className="mt-5">
        <h3 className="mb-2.5 text-xl font-bold text-[#536166] max-md:flex max-md:flex-col">
          {title}
        </h3>
        <ul className="flex items-center justify-start overflow-x-scroll scroll-smooth">
          <Skeleton className="m-1.5 h-[120px] w-[200px] flex-[0_0_200px] rounded-[20px]" />
          <Skeleton className="m-1.5 h-[120px] w-[200px] flex-[0_0_200px] rounded-[20px]" />
          <Skeleton className="m-1.5 h-[120px] w-[200px] flex-[0_0_200px] rounded-[20px]" />
          <Skeleton className="m-1.5 h-[120px] w-[200px] flex-[0_0_200px] rounded-[20px]" />
          <Skeleton className="m-1.5 h-[120px] w-[200px] flex-[0_0_200px] rounded-[20px]" />
          <Skeleton className="m-1.5 h-[120px] w-[200px] flex-[0_0_200px] rounded-[20px]" />
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
          {list.map(({
            id, message, created_time, updated_time,
          }) => (
            <Card
              key={id}
              id={id}
              message={message}
              date={created_time ?? updated_time}
              title={title}
            />
          ))}
        </ul>
      </Marquee>
    </div>
  );
};

export default CardList;
