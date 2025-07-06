import NextImage, { ImageProps as NextImageProps } from "next/image";

export type ImageProps = NextImageProps;

export function Image({ src, alt, ...props }: ImageProps) {
  return <NextImage src={src} alt={alt} {...props} />;
}
