import React from 'react';
import { Badge } from '@/components/ui/badge';
import { useRouter } from 'next/router';
import { HOT_TAGS } from '@/constants/category';

const SearchField = () => {
  const router = useRouter();
  return (
    <ul className="flex justify-center items-center flex-wrap max-md:justify-start">
      {HOT_TAGS.map(({ value, label }) => (
        <li key={value}>
          <Badge
            onClick={() => router.push(`/resource/categories/${value}`)}
            className="bg-white opacity-80 cursor-pointer m-1 whitespace-nowrap font-medium text-base hover:opacity-100 hover:bg-white transition-transform duration-[400ms]"
          >
            {label}
          </Badge>
        </li>
      ))}
    </ul>
  );
};

export default SearchField;
