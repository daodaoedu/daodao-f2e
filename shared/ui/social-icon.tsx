// 靜態導入所有 social icons
import FacebookIcon from '@/public/assets/social-icons/facebook.svg';
import LineIcon from '@/public/assets/social-icons/line.svg';
import LinkedinIcon from '@/public/assets/social-icons/linkedin.svg';
import ThreadsIcon from '@/public/assets/social-icons/threads.svg';
import XIcon from '@/public/assets/social-icons/x.svg';
import GithubIcon from '@/public/assets/social-icons/github.svg';
import InstagramIcon from '@/public/assets/social-icons/instagram.svg';
import DiscordIcon from '@/public/assets/social-icons/discord.svg';
import { cn } from '../lib/cn';

export type SocialPlatform =
  | 'facebook'
  | 'line'
  | 'linkedin'
  | 'threads'
  | 'x'
  | 'github'
  | 'instagram'
  | 'discord';

interface IconComponentProps {
  width: number;
  height: number;
  className?: string;
}

interface IconComponent {
  Component: React.ComponentType<IconComponentProps>;
  name: string;
  className?: string;
}

export const iconMap: Record<SocialPlatform, IconComponent> = {
  facebook: {
    Component: FacebookIcon,
    name: 'Facebook',
    className: 'text-[#1877F2]', // Facebook 藍
  },
  line: {
    Component: LineIcon,
    name: 'LINE',
    className: 'text-[#00C300]', // Line 綠
  },
  linkedin: {
    Component: LinkedinIcon,
    name: 'LinkedIn',
    className: 'text-[#0A66C2]', // LinkedIn 藍
  },
  threads: {
    Component: ThreadsIcon,
    name: 'Threads',
    className: 'text-black', // Threads 黑
  },
  x: {
    Component: XIcon,
    name: 'X',
    className: 'text-black', // X (Twitter) 黑
  },
  github: {
    Component: GithubIcon,
    name: 'GitHub',
    className: 'text-[#181717]', // GitHub 深灰黑
  },
  instagram: {
    Component: InstagramIcon,
    name: 'Instagram',
    className: 'text-[#E4405F]', // Instagram 粉紅 (主色)
  },
  discord: {
    Component: DiscordIcon,
    name: 'Discord',
    className: 'text-[#5865F2]', // Discord 紫
  },
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
  const { Component, className: iconClassName } = iconMap[platform];

  return (
    <Component
      width={size}
      height={size}
      className={cn(iconClassName, className)}
    />
  );
};
