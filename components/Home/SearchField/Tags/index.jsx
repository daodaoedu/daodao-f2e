import React from 'react';
import { Badge } from '@/components/ui/badge';
import { useRouter } from 'next/navigation';
import { HOT_TAGS } from '@/constants/category';

const SearchField = () => {
  const router = useRouter();
  return (
    <ul className="flex flex-wrap items-center justify-center max-md:justify-start">
      {HOT_TAGS.map(({ value, label }) => (
        <li key={value}>
          <Badge
            onClick={() => router.push(`/resource/categories/${value}`)}
            className="m-1 cursor-pointer whitespace-nowrap bg-white text-base font-medium opacity-80 transition-transform hover:bg-white hover:opacity-100"
          >
            {label}
          </Badge>
        </li>
      ))}
    </ul>
  );
};

export default SearchField;
