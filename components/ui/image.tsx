import NextImage, { ImageProps as NextImageProps } from "next/image";
import emptyCoverPng from "@/public/assets/empty-cover.png";

export type ImageProps = NextImageProps;

export function Image({ src, alt, onError, ...props }: ImageProps) {
  const handleError = (
    event: React.SyntheticEvent<HTMLImageElement, Event>
  ) => {
    const target = event.currentTarget as HTMLImageElement;
    target.src = emptyCoverPng.src;
    onError?.(event);
  };
  return <NextImage src={src} alt={alt} {...props} onError={handleError} />;
}
