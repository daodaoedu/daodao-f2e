'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import dynamic from 'next/dynamic';
import { usePathname } from 'next/navigation';
import { MapPinIcon, PencilIcon } from 'lucide-react';
import { Container, Paper } from '@/shared/ui/wrapper';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/ui/avatar';
import { CustomLink } from '@/shared/ui/custom-link';
import { Button, TextCollapse } from '@/shared/ui';
import { Badge } from '@/shared/ui/badge';
import { iconMap, SocialIcon, SocialPlatform } from '@/shared/ui/social-icon';
import { useAuth , getUserProfileBasePath, UserIdObject } from '@/entities/user';
import { useUserData } from '../lib/use-user-data';
import { UserProfileEditorLoading } from './user-profile-editor';
import {
  USER_PROFILE_TAB_TITLES,
  UserProfileTabTitle,
} from '../model/user-profile';

const UserProfileEditor = dynamic(
  () => import('./user-profile-editor').then((mod) => mod.UserProfileEditor),
  {
    ssr: false,
    loading: UserProfileEditorLoading,
  }
);

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
  userIdObject: UserIdObject;
}

export function UserProfileWidget({
  userIdObject,
  children,
}: UserProfileWidgetProps) {
  const { user: loginUser } = useAuth();
  const { data } = useUserData(userIdObject);
  const [isEditing, setIsEditing] = useState(false);
  const user = data?.data;
  const pathname = usePathname();
  const basePath = getUserProfileBasePath(user);
  const isOwnProfile = loginUser?.id === user?.id;

  const navItems: { label: UserProfileTabTitle; href: string }[] = [
    {
      label: USER_PROFILE_TAB_TITLES.projects,
      href: `${basePath}/projects`,
    },
    {
      label: USER_PROFILE_TAB_TITLES.practices,
      href: `${basePath}/practices`,
    },
    {
      label: USER_PROFILE_TAB_TITLES.resources,
      href: `${basePath}/resources`,
    },
    {
      label: USER_PROFILE_TAB_TITLES.ideas,
      href: `${basePath}/ideas`,
    },
    {
      label: USER_PROFILE_TAB_TITLES.circles,
      href: `${basePath}/circles`,
    },
  ];

  const handleCopyContact = async (platform: SocialPlatform) => {
    const contactValue = getContactValue(user?.contactList, platform);
    const platformName = iconMap[platform].name;
    if (contactValue) {
      await navigator.clipboard.writeText(contactValue);
      toast.success(`已複製 ${platformName} ID`);
    }
  };

  if (isEditing) {
    return (
      <div className="min-h-screen space-y-8 bg-primary-pale px-4 py-24">
        <Container className="max-w-4xl">
          <UserProfileEditor
            initialData={user}
            onClose={() => setIsEditing(false)}
          />
        </Container>
      </div>
    );
  }

  return (
    <div className="min-h-screen space-y-8 bg-primary-pale px-4 py-24">
      <Container className="max-w-4xl">
        <div className="space-y-4">
          <div className="flex justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="size-20">
                <AvatarImage
                  src={user?.photoURL || ''}
                  alt={user?.name ?? 'user avatar'}
                />
                <AvatarFallback className="bg-primary-base text-2xl font-semibold text-white">
                  {user?.name?.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <div className="space-y-1">
                <div className="flex items-end gap-2">
                  <h1 className="text-basic-800 heading-sm">{user?.name}</h1>
                  {user?.customId && (
                    <p className="text-basic-500">@{user?.customId}</p>
                  )}
                </div>

                {user?.location && (
                  <p className="flex items-center gap-0.5 text-basic-500">
                    <MapPinIcon className="size-4" />
                    {user?.location}
                  </p>
                )}

                <div className="flex items-center gap-4">
                  {socialPlatformList.map(({ platform, generateHref }) => {
                    const contactValue = getContactValue(
                      user?.contactList,
                      platform
                    );

                    if (!contactValue) {
                      return null;
                    }

                    return generateHref ? (
                      <Button
                        key={platform}
                        variant="ghost"
                        size="icon"
                        className="size-7"
                        asChild
                      >
                        <CustomLink
                          href={generateHref(contactValue)}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <SocialIcon platform={platform} size={28} />
                        </CustomLink>
                      </Button>
                    ) : (
                      <Button
                        key={platform}
                        variant="ghost"
                        className="flex items-center gap-0.5 p-0"
                        onClick={() => handleCopyContact(platform)}
                      >
                        <SocialIcon platform={platform} size={28} />
                        <span className="text-sm text-basic-600">
                          {contactValue}
                        </span>
                      </Button>
                    );
                  })}
                </div>
              </div>
            </div>

            {isOwnProfile && (
              <Button
                variant="outline"
                size="icon"
                onClick={() => setIsEditing(true)}
              >
                <PencilIcon className="size-4" />
              </Button>
            )}
          </div>

          <p className="text-basic-600">{user?.personalSlogan}</p>

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

          {user?.selfIntroduction && (
            <div className="space-y-3">
              <h2 className="text-basic-700 heading-sm border-l-4 border-primary-base pl-4 font-semibold">
                關於我
              </h2>
              <TextCollapse
                text={user?.selfIntroduction}
                maxLines={2}
                className="text-basic-600"
              />
            </div>
          )}
        </div>
      </Container>

      <Container className="max-w-4xl space-y-3">
        <h2 className="text-basic-700 heading-sm border-l-4 border-primary-base pl-4 font-semibold">
          技能地圖
        </h2>
        <Paper>功能即將開放，敬請期待。</Paper>
      </Container>

      <Container className="max-w-4xl">
        <div className="overflow-x-auto px-2 pb-3">
          <nav className="flex gap-3">
            {navItems.map((item) => (
              <Button
                variant={
                  pathname === item.href || `${pathname}/projects` === item.href
                    ? 'default'
                    : 'outline'
                }
                asChild
                className="rounded-md"
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
