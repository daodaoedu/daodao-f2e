import NextImage, { ImageProps as NextImageProps } from 'next/image';
import { useState } from 'react';
import { cn } from '@/utils/cn';
import emptyCoverPng from '@/public/assets/empty-cover.png';

export type ImageProps = NextImageProps;

export function Image({ src, alt, className, onError, ...props }: ImageProps) {
  const [isError, setIsError] = useState(false);
  const handleError = (
    event: React.SyntheticEvent<HTMLImageElement, Event>
  ) => {
    const target = event.currentTarget as HTMLImageElement;
    target.src = emptyCoverPng.src;
    setIsError(true);
    onError?.(event);
  };
  return (
    <NextImage
      src={src}
      alt={alt}
      className={cn(
        className,
        isError && 'p-4 object-contain bg-primary-palest'
      )}
      {...props}
      onError={handleError}
    />
  );
}
