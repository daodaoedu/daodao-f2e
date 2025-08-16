import React from 'react';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import { Skeleton } from '@/components/ui/skeleton';

const Avator = ({ photoURL }) => (
  <LazyLoadImage
    alt="login"
    src={photoURL || ''}
    height={80}
    width={80}
    effect="opacity"
    style={{
      borderRadius: '100%',
      background: 'rgba(240, 240, 240, .8)',
      objectFit: 'cover',
      objectPosition: 'center',
      minHeight: '80px',
      minWidth: '80px',
    }}
    placeholder={
        // eslint-disable-next-line react/jsx-wrap-multilines
      <Skeleton
        className="h-20 w-20 rounded-full mt-1"
        style={{
          background: 'rgba(240, 240, 240, .8)',
        }}
      />
      }
  />
);

export default Avator;
