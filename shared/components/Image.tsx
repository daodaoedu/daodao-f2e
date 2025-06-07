import { useState } from 'react';
import Skeleton from '@mui/material/Skeleton';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import emptyCoverWithBackgroundImg from '@/public/assets/empty-cover-with-background.png';
import { cn } from '@/utils/cn';

const Loading = ({ height }: { height: string }) => (
  <Skeleton
    variant="rectangular"
    height={height}
    sx={{ marginTop: '4px' }}
    animation="wave"
  />
);

type ImageProps = {
  src: string;
  alt: string;
  width?: string;
  height?: string;
  background?: string;
  borderRadius?: string;
  className?: string;
  wrapperClassName?: string;
};

/** TODO: background 與 borderRadius 未來逐步替換到 tailwind */
const Image = ({
  src,
  alt,
  width = '100%',
  height = '122px',
  background = 'transparent',
  borderRadius = '8px',
  className,
  wrapperClassName,
}: ImageProps) => {
  const [isError, setIsError] = useState(false);
  return (
    <LazyLoadImage
      src={isError || !src ? emptyCoverWithBackgroundImg.src : src}
      alt={alt}
      width={width}
      height={height}
      effect="opacity"
      className={cn('object-cover object-center', className)}
      wrapperClassName={wrapperClassName}
      style={{
        borderRadius,
        background,
        height,
      }}
      placeholder={<Loading height={height} />}
      onError={() => setIsError(true)}
    />
  );
};

export default Image;
