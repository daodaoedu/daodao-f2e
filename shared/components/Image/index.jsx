import Skeleton from '@mui/material/Skeleton';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import emptyCoverWithBackgroundImg from '@/public/assets/empty-cover-with-background.png';
import { useState } from 'react';

const Loading = ({ height }) => (
  <Skeleton
    variant="rectangular"
    height={height}
    sx={{ marginTop: '4px' }}
    animation="wave"
  />
);

const Image = ({
  src,
  alt,
  width = '100%',
  height = '122px',
  background = 'transparent',
  borderRadius = '8px',
}) => {
  const [isError, setIsError] = useState(false);
  return (
    <LazyLoadImage
      src={isError ? emptyCoverWithBackgroundImg.src : src}
      alt={alt}
      width={width}
      height={height}
      effect="opacity"
      style={{
        objectFit: 'cover',
        objectPosition: 'center',
        borderRadius,
        background,
      }}
      placeholder={<Loading height={height} />}
      onError={() => setIsError(true)}
    />
  );
};

export default Image;
