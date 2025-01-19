import React from 'react';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import { Skeleton } from '@mui/material';

const Avator = ({ photoURL }) => {
  return (
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
          sx={{
            height: '80px',
            width: '80px',
            background: 'rgba(240, 240, 240, .8)',
            marginTop: '4px',
          }}
          variant="circular"
          animation="wave"
        />
      }
    />
  );
};

export default Avator;
