import React from 'react';
import { LazyLoadImage } from 'react-lazy-load-image-component';

import { Skeleton } from '@/components/ui/skeleton';

const EditAvator = ({
  url = 'https://imgur.com/EADd1UD.png',
  height = 128,
  width = 128,
}) => (
  <LazyLoadImage
    alt="login"
    src={url}
    height={height}
    width={width}
    effect="opacity"
    style={{
      marginTop: '24px',
      borderRadius: '100%',
      background: 'rgba(240, 240, 240, .8)',
      objectFit: 'cover',
      objectPosition: 'center',
      minWidth: `${width}px`,
      minHeight: `${height}px`,
    }}
    placeholder={
        // eslint-disable-next-line react/jsx-wrap-multilines
      <Skeleton
        className="h-32 w-32 rounded-full mt-1"
        style={{
          background: 'rgba(240, 240, 240, .8)',
        }}
      />
      }
  />
);

export default EditAvator;
