'use client';

import { useState } from 'react';
import { useCircle } from '@/entities/circle';
import { Paper } from '@/shared/ui/wrapper';
import { BackButton } from '@/shared/ui/back-button';
import { Image } from '@/shared/ui/image';
import { AspectRatio } from '@/shared/ui/aspect-ratio';
import { cn } from '@/shared/lib/cn';
import { Badge } from '@/shared/ui/badge';
import { getShareAPI } from '@/shared/lib/share';
import FacebookSvg from '@/public/assets/social-icons/facebook.svg';
import LineSvg from '@/public/assets/social-icons/line.svg';
import LinkedInSvg from '@/public/assets/social-icons/linkedin.svg';
import ShareWindowsSvg from '@/public/assets/social-icons/share_windows.svg';
import ThreadsSvg from '@/public/assets/social-icons/threads.svg';
import XSvg from '@/public/assets/social-icons/x.svg';
import BachelorCapSvg from '@/public/assets/icons/bachelorCap.svg';
import ActivityCategorySvg from '@/public/assets/icons/activityCategory.svg';
import CategorySvg from '@/public/assets/icons/category.svg';
import ClockSvg from '@/public/assets/icons/clock.svg';
import LocationSvg from '@/public/assets/icons/location.svg';
import PersonSvg from '@/public/assets/icons/person.svg';
import OutcomeSvg from '@/public/assets/icons/outcome_icon.svg';
import MotivationSvg from '@/public/assets/icons/motivation_icon.svg';
import More from '@/public/assets/icons/more.svg';
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/ui';
import { Text, Title } from '@/shared/ui/typography';
import { EDUCATION, ROLE } from '@/constants/member';
import { getOptionLabel, getOptionLabels } from '@/shared/lib/option';
import { ALL_AREAS, AREAS, TBD_OPTION } from '@/constants/areas';
import { ACTIVITY_CATEGORIES, CATEGORIES } from '@/constants/category';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/ui/avatar';
import DefaultAvatar from '@/public/assets/icons/default-avatar.svg';
import dynamic from 'next/dynamic';
import { timeDuration } from '@/shared/lib/date';
import { ContactModal, TargetUserType } from '@/features/email';
import { getUserProfileBasePath, useAuth } from '@/entities/user';
import { CircleEditForm } from './circle-edit-form';
import { CustomLink } from '@/shared/ui/custom-link';

const MarkdownEditor = dynamic(
  () =>
    import('@/shared/ui/markdown-editor').then((mod) => ({
      default: mod.MarkdownEditor,
    })),
  {
    ssr: false,
    loading: () => <div className="h-32 animate-pulse rounded bg-gray-100" />,
  }
);

interface CircleDetailWidgetProps {
  circleId: string;
}

export const CircleDetailWidget = ({ circleId }: CircleDetailWidgetProps) => {
  const { user } = useAuth();
  const { data } = useCircle({ id: circleId });
  const [isEditing, setIsEditing] = useState(false);

  if (!data) {
    return null;
  }

  if (isEditing) {
    return <CircleEditForm data={data} onClose={() => setIsEditing(false)} />;
  }

  const shareAPI = getShareAPI({
    title: data.title,
    url: `/circles/${data._id}`,
  });

  const labels = [
    {
      key: 'category',
      Icon: CategorySvg,
      title: '學習領域',
      text: getOptionLabels(CATEGORIES, data.category).join('、'),
    },
    {
      key: 'activityCategory',
      Icon: ActivityCategorySvg,
      title: '揪團類型',
      text: getOptionLabels(ACTIVITY_CATEGORIES, data.activityCategory).join(
        '、'
      ),
    },
    {
      key: 'area',
      Icon: LocationSvg,
      title: '地點',
      text: getOptionLabel(ALL_AREAS, data.area, TBD_OPTION.label),
    },
    { key: 'time', Icon: ClockSvg, title: '時間', text: data.time },
    {
      key: 'participator',
      Icon: PersonSvg,
      title: '徵求人數',
      text: data.participator,
    },
    {
      key: 'partnerStyle',
      Icon: PersonSvg,
      title: '想找的夥伴',
      text: data.partnerStyle,
    },
    {
      key: 'partnerEducationStep',
      Icon: BachelorCapSvg,
      title: '適合的教育階段',
      text: getOptionLabels(EDUCATION, data.partnerEducationStep).join('、'),
    },
    {
      key: 'motivation',
      Icon: MotivationSvg,
      title: '揪團動機',
      text: data.motivation,
    },
    {
      key: 'outcome',
      Icon: OutcomeSvg,
      title: '期待成果',
      text: data.outcome,
    },
  ];

  const organizer: TargetUserType = {
    id: data.user.userId,
    email: data.user.email,
    photoURL: data.user.photoURL,
    name: data.user.name,
    roleList: data.user.roleList,
  };
  const isOwnCircle = user?.id === organizer.id;

  return (
    <>
      <BackButton />

      <AspectRatio ratio={2 / 1} className="relative overflow-hidden rounded">
        <Image
          src={data.photoURL}
          alt={data.photoAlt}
          className="object-cover"
          fill
        />
      </AspectRatio>

      <header className="space-y-2 p-2.5">
        <div className="flex items-center justify-between">
          <Badge
            className={cn(
              "rounded px-1.5 py-1 text-xs font-bold before:mr-1.5 before:block before:size-1.5 before:rounded-full before:content-['']",
              data.isGrouping
                ? 'bg-primary-lightest text-primary-base before:bg-primary-base'
                : 'bg-basic-100 text-basic-300 before:bg-basic-300'
            )}
          >
            {data.isGrouping ? '揪團中' : '已結束'}
          </Badge>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <More />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem asChild={!isOwnCircle}>
                {isOwnCircle ? (
                  <button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    className="block w-full p-2 text-left"
                  >
                    編輯
                  </button>
                ) : (
                  <CustomLink
                    href="https://forms.gle/NkVbDWC3eXk4P4gv7"
                    target="_blank"
                    className="block p-2"
                  >
                    檢舉
                  </CustomLink>
                )}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex items-center gap-1">
          <Text>分享至</Text>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="size-6 [&_svg]:text-[#1877F2]"
              onClick={shareAPI.facebookShare}
            >
              <FacebookSvg className="size-6" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="size-6 [&_svg]:text-black"
              onClick={shareAPI.threadsShare}
            >
              <ThreadsSvg className="size-6" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="size-6 [&_svg]:text-[#0A66C2]"
              onClick={shareAPI.linkedinShare}
            >
              <LinkedInSvg className="size-6" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="size-6 [&_svg]:text-black"
              onClick={shareAPI.xShare}
            >
              <XSvg className="size-6" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="size-6 [&_svg]:text-[#00B900]"
              onClick={shareAPI.lineShare}
            >
              <LineSvg className="size-6" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="size-6 text-basic-400"
              onClick={shareAPI.nativeShare}
            >
              <ShareWindowsSvg className="size-6" />
            </Button>
          </div>
        </div>
        <Title as="h1" size="md">
          {data.title}
        </Title>
      </header>

      <Paper className="mb-4 md:p-8" asChild>
        <ul>
          {labels.map(
            ({ key, Icon, title, text }) =>
              text && (
                <li
                  key={key}
                  className={cn(
                    'flex items-center',
                    'py-1.5 first-of-type:pt-0 last-of-type:pb-0',
                    'border-b border-solid border-basic-200 last-of-type:border-b-0'
                  )}
                >
                  <Title
                    size="sm"
                    className="flex shrink-0 basis-36 items-center gap-1 text-sm font-bold"
                  >
                    <Icon />
                    {title}
                  </Title>
                  <Text size="sm">{text}</Text>
                </li>
              )
          )}
        </ul>
      </Paper>

      <Paper className="mb-4 md:p-8" asChild>
        <section>
          <header className="flex justify-between">
            <CustomLink href={getUserProfileBasePath({ id: data.user.userId })}>
              <div className="flex items-center">
                <Avatar className="mr-3 mt-1 size-12">
                  <AvatarImage src={data.user.photoURL} />
                  <AvatarFallback className="text-xl">
                    <DefaultAvatar />
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center">
                    <h2 className="body-md font-bold">{data.user.name}</h2>
                    {data.user.educationStage && (
                      <Badge
                        className="body-sm ml-3 rounded px-2"
                        variant="gray"
                      >
                        {getOptionLabel(EDUCATION, data.user.educationStage)}
                      </Badge>
                    )}
                  </div>
                  <span className="body-sm">
                    {getOptionLabel(ROLE, data.user.roleList[0] ?? '')}
                  </span>
                </div>
              </div>
            </CustomLink>

            <div className="flex items-center gap-1">
              <LocationSvg />
              <span className="body-sm">
                {getOptionLabel(AREAS, data.user.location, '暫不透露')}
              </span>
            </div>
          </header>

          <Title as="h2" size="md" className="my-4">
            揪團內容與進行方式
          </Title>

          <MarkdownEditor readOnly value={data.content} />

          <footer className="mt-4 flex flex-wrap gap-1">
            {Array.isArray(data?.tagList) &&
              data.tagList.map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="bg-primary-lightest font-bold"
                >
                  {tag}
                </Badge>
              ))}
          </footer>
        </section>
      </Paper>

      <Paper className="md:p-8" asChild>
        <footer>
          <Title as="h2" size="md" className="my-4">
            注意事項
          </Title>

          <MarkdownEditor readOnly value={data.notice} />

          <div className="mt-2 flex justify-end text-xs">
            <time dateTime={data.updatedDate}>
              {timeDuration(data.updatedDate)}
            </time>
          </div>
        </footer>
      </Paper>

      {!isOwnCircle && (
        <div className="mt-8 flex justify-center">
          <ContactModal
            targetUser={organizer}
            emailTitle="你發起的揪團有人來信!"
            emailSubject="【島島阿學】點開 Email,揪團有新消息"
            modalTitle="聯繫主揪"
            description="想跟主揪說的話"
            descriptionPlaceholder="想參加主揪的團體嗎?可以簡單的自我介紹,寫下想加入的原因。"
          />
        </div>
      )}
    </>
  );
};
