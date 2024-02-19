import React from 'react';
import { LazyLoadImage } from 'react-lazy-load-image-component';

import { Skeleton } from '@mui/material';

const EditAvator = ({
  url = 'https://imgur.com/EADd1UD.png',
  height = 128,
  width = 128,
}) => {
  return (
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
          sx={{
            height: '128px',
            width: '128px',
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

export default EditAvator;
