'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { usePathname } from 'next/navigation';
import { PencilIcon } from 'lucide-react';
import { Container, Paper } from '@/shared/ui/wrapper';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/ui/avatar';
import { CustomLink } from '@/shared/ui/custom-link';
import { Button } from '@/shared/ui';
import { Badge } from '@/shared/ui/badge';
import { SocialIcon, SocialPlatform } from '@/shared/ui/social-icon';
import { useTranslation } from '@/shared/lib/translation';
import { AREA_OPTIONS } from '@/entities/area/model/constants';
import { useSession, useSessionActions } from '@/entities/session';
import { UserValidatorsUpdateUserSchema } from '@/models/userValidatorsUpdateUserSchema';
import { useUserData } from '../lib/use-user-data';

const UserProfileEditor = dynamic(
  () => import('./user-profile-editor').then((mod) => mod.UserProfileEditor),
  { ssr: false }
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
  type: 'customId' | 'userId';
  id: string;
}

export function UserProfileWidget({
  type,
  id,
  children,
}: UserProfileWidgetProps) {
  const { user: loginUser } = useSession();
  const { updateUser } = useSessionActions();
  const { data } = useUserData({ type, id });
  const [isEditing, setIsEditing] = useState(false);
  const user = data?.data;
  const pathname = usePathname();
  const basePath = type === 'customId' ? `/me/${id}` : `/users/${id}`;
  const { t } = useTranslation();
  const isOwnProfile = loginUser?.id === user?.id;
  const handleSave = async (updateUserSchema: UserValidatorsUpdateUserSchema) => {
    await updateUser(updateUserSchema);
    setIsEditing(false);
  };

  const navItems = [
    {
      label: '基本資訊',
      href: `${basePath}`,
    },
    {
      label: '學習計劃',
      href: `${basePath}/projects`,
    },
    {
      label: '主題實踐',
      href: `${basePath}/practices`,
    },
    {
      label: '分享資源',
      href: `${basePath}/resources`,
    },
    {
      label: '想法',
      href: `${basePath}/ideas`,
    },
    {
      label: '發起揪團',
      href: `${basePath}/circles`,
    },
  ];

  const area = AREA_OPTIONS.find((option) => option.value === user?.location);

  if (isEditing) {
    return (
      <div className="min-h-screen space-y-8 bg-primary-pale px-4 py-24">
        <Container>
          <UserProfileEditor
            initialData={user}
            onSave={handleSave}
            onCancel={() => setIsEditing(false)}
          />
        </Container>
      </div>
    );
  }

  return (
    <div className="min-h-screen space-y-8 bg-primary-pale px-4 py-24">
      <Container>
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

              <div className="space-y-2">
                <h1 className="text-basic-800 text-2xl font-bold">
                  {user?.name}
                </h1>
                {area?.label && (
                  <p className="text-basic-500">{t(area.label)}</p>
                )}
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

          <p className="max-w-2xl text-basic-600">
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
