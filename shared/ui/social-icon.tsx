import { Image } from './image';

export type SocialPlatform =
  | 'facebook'
  | 'line'
  | 'linkedin'
  | 'threads'
  | 'x'
  | 'github'
  | 'instagram'
  | 'discord';

const getIconPath = (iconPlatform: SocialPlatform) => {
  switch (iconPlatform) {
    case 'facebook':
    case 'line':
    case 'linkedin':
    case 'threads':
    case 'x':
    case 'github':
    case 'instagram':
    case 'discord':
      return `/assets/social-icons/${iconPlatform}.svg`;
    default:
      return '';
  }
};

interface SocialIconProps {
  platform: SocialPlatform;
  size?: number;
  className?: string;
}

export const SocialIcon = ({
  platform,
  size = 20,
  className,
}: SocialIconProps) => {
  const iconPath = getIconPath(platform);

  if (!iconPath) return null;

  return (
    <Image
      src={iconPath}
      alt={platform}
      width={size}
      height={size}
      className={className}
    />
  );
};
