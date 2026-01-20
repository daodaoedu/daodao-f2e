import NextImage, { type ImageProps, type StaticImageData } from "next/image";

const Image = ({ src, alt, ...props }: ImageProps) => {
  return <NextImage src={src} alt={alt} {...props} />;
};

export { Image, type StaticImageData, type ImageProps };
