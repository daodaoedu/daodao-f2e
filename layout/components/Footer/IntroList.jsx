import React from 'react';
import { Text } from '@/shared/ui/typography';
import { CustomLink } from '@/shared/ui/custom-link';

const IntroList = ({ list }) => (
  <div className="mx-[15px] [&>li]:mx-auto [&>li]:my-2 [&>li]:mr-0 [&>li]:cursor-pointer [&>li]:text-left [&>ul]:flex [&>ul]:flex-col [&>ul]:justify-start">
    <ul>
      {list.map(({ name, link, target }) => (
        <li key={name}>
          {target === '_self' ? (
            <CustomLink href={link} passHref>
              <Text className="text-base">
                {name}
              </Text>
            </CustomLink>
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
