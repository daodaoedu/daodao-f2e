import React from 'react';
import { Text } from '@/components/ui/typography';
import Link from 'next/link';

const IntroList = ({ list }) => (
  <div className="mx-[15px] [&>ul]:flex [&>ul]:flex-col [&>ul]:justify-start [&>li]:cursor-pointer [&>li]:my-2 [&>li]:mx-auto [&>li]:mr-0 [&>li]:text-left">
    <ul>
      {list.map(({ name, link, target }) => (
        <li key={name}>
          {target === '_self' ? (
            <Link href={link} passHref>
              <Text className="text-base">
                {name}
              </Text>
            </Link>
          ) : (
            <a href={link} target="_blank" rel="noopener noreferrer">
              <Text className="text-base">
                {name}
              </Text>
            </a>
          )}
        </li>
      ))}
    </ul>
  </div>
);

export default IntroList;
