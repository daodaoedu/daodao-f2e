import React from 'react';
import { Text } from '@/components/ui/typography';

const SubFooter = ({ title, list }) => (
  <div className="[&>ul]:flex [&>ul]:justify-start [&>ul]:items-center [&>ul]:mt-[15px] [&>li]:cursor-pointer [&>li]:mx-2.5 [&>li]:my-auto">
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
