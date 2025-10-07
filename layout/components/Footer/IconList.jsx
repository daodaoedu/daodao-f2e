import React from 'react';
import { Text } from '@/shared/ui/typography';

const SubFooter = ({ title, list }) => (
  <div className="[&>li]:mx-2.5 [&>li]:my-auto [&>li]:cursor-pointer [&>ul]:mt-[15px] [&>ul]:flex [&>ul]:items-center [&>ul]:justify-start">
    <Text
      as="h2"
      className="mb-2.5 text-lg font-medium"
    >
      {title}
    </Text>
    <ul>
      {list.map((value) => (
        <a
          key={value.alt}
          href={value.link}
          target="_blank"
          rel="noopener noreferrer"
        >
          <li>{value.icon}</li>
        </a>
      ))}
    </ul>
  </div>
);

export default SubFooter;
