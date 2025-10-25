'use client';

import { useMemo } from 'react';
import { usePathname } from 'next/navigation';
import { Container, Paper } from '@/shared/ui/wrapper';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/ui/avatar';
import { CustomLink } from '@/shared/ui/custom-link';
import { Button } from '@/shared/ui';
import { Badge } from '@/shared/ui/badge';
import { SocialIcon, SocialPlatform } from '@/shared/ui/social-icon';
import { useGetApiV1UsersCustomIdCustomId } from '@/api/users.client';

interface SocialPlatformItem {
  platform: SocialPlatform;
  generateHref?: (platform: string) => string;
}

const socialPlatformList: SocialPlatformItem[] = [
  {
    platform: 'instagram',
    generateHref: (instagram: string) =>
      `https://www.instagram.com/${instagram}`,
  },
  {
    platform: 'facebook',
    generateHref: (facebook: string) => `https://www.facebook.com/${facebook}`,
  },
  {
    platform: 'line',
  },
  {
    platform: 'discord',
  },
];

const getContactValue = (
  contactList: Record<string, unknown> | null | undefined,
  platform: string
): string | null => {
  if (!contactList || !(platform in contactList)) {
    return null;
  }
  const value = contactList[platform];
  return typeof value === 'string' && value.trim() !== '' ? value : null;
};

interface UserProfileWidgetProps extends React.PropsWithChildren {
  customId: string;
}

export function UserProfileWidget({
  customId,
  children,
}: UserProfileWidgetProps) {
  const { data } = useGetApiV1UsersCustomIdCustomId(customId);
  const user = data?.data;
  const pathname = usePathname();

  const navItems = useMemo(
    () => [
      {
        label: '基本資訊',
        href: `/me/${customId}`,
      },
      {
        label: '學習計劃',
        href: `/me/${customId}/projects`,
      },
      {
        label: '主題實踐',
        href: `/me/${customId}/practices`,
      },
      {
        label: '分享資源',
        href: `/me/${customId}/resources`,
      },
      {
        label: '想法',
        href: `/me/${customId}/ideas`,
      },
      {
        label: '發起揪團',
        href: `/me/${customId}/circles`,
      },
    ],
    [customId]
  );

  return (
    <div className="min-h-screen space-y-8 bg-primary-pale px-4 py-24">
      <Container>
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <Avatar className="size-20">
              <AvatarImage
                src={user?.photoURL ?? undefined}
                alt={user?.name ?? 'user avatar'}
              />
              <AvatarFallback className="bg-primary-base text-2xl font-semibold text-white">
                {user?.name?.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <div className="space-y-2">
              <h1 className="text-basic-800 text-2xl font-bold">
                {user?.name}
              </h1>
              <p className="text-basic-500">{user?.location}</p>
            </div>
          </div>

          <p className="max-w-2xl text-center text-basic-600">
            {user?.personalSlogan}
          </p>

          <div className="flex flex-wrap gap-2">
            {user?.tagList?.map((tag) => (
              <Badge key={tag} variant="secondary">
                {tag}
                <span className="ml-2 flex size-5 items-center justify-center rounded-full bg-basic-200 text-xs text-basic-500">
                  1
                </span>
              </Badge>
            ))}
          </div>

          <div className="flex items-center gap-4">
            {socialPlatformList.map(({ platform, generateHref }) => {
              const contactValue = getContactValue(user?.contactList, platform);

              if (!contactValue) {
                return null;
              }

              return generateHref ? (
                <Button
                  key={platform}
                  variant="ghost"
                  size="icon"
                  className="size-6"
                  asChild
                >
                  <CustomLink
                    href={generateHref(contactValue)}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <SocialIcon platform={platform} />
                  </CustomLink>
                </Button>
              ) : (
                <div key={platform} className="flex items-center gap-2">
                  <SocialIcon platform={platform} />
                  <span className="text-sm text-basic-600">{contactValue}</span>
                </div>
              );
            })}
          </div>
        </div>
      </Container>

      <Container>
        <div className="overflow-x-auto p-2 pb-8">
          <nav className="flex gap-3">
            {navItems.map((item) => (
              <Button
                variant={pathname === item.href ? 'default' : 'outline'}
                asChild
                key={item.label}
              >
                <CustomLink href={item.href} scroll={false}>
                  {item.label}
                </CustomLink>
              </Button>
            ))}
          </nav>
        </div>

        <Paper>{children}</Paper>
      </Container>
    </div>
  );
}
