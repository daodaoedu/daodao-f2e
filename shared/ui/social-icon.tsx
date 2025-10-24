import { Image } from './image';

type SocialPlatform = 'facebook' | 'line' | 'linkedin' | 'threads' | 'x';

const getIconPath = (iconPlatform: SocialPlatform) => {
  switch (iconPlatform) {
    case 'facebook':
      return '/assets/social-icons/facebook.svg';
    case 'line':
      return '/assets/social-icons/line.svg';
    case 'linkedin':
      return '/assets/social-icons/linkedin.svg';
    case 'threads':
      return '/assets/social-icons/threads.svg';
    case 'x':
      return '/assets/social-icons/x.svg';
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
