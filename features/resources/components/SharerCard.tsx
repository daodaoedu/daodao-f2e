import React from 'react';

import { Image } from '@/components/ui/image';

import ShareResourceIcon from '@/public/assets/icons/share-resource.svg';
import CommentIcon from '@/public/assets/icons/comment.svg';
import CrownIcon from '@/public/assets/icons/crown.svg';
import { cn } from '@/utils/cn';

type SharerCardProps = {
  className?: string;
  userName?: string;
  userImg?: string;
  sourceCount?: number;
  reflectionCount?: number;
  order: number;
};

export default function SharerCard(props: SharerCardProps) {
  const {
    className,
    userName = '小許',
    userImg = 'https://fakeimg.pl/282/',
    sourceCount = 80,
    reflectionCount = 20,
    order = 1,
  } = props;

  return (
    <div className={cn('rounded-xl', className)}>
      <div className="relative h-[17.625rem] overflow-hidden rounded-t-xl">
        <Image
          src={userImg}
          alt="avatar"
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 w-full bg-gradient-to-b from-transparent to-primary-base/80" />
        <div className="absolute bottom-[0.8125rem] left-1/2 -translate-x-1/2 text-white">
          {userName}
        </div>
        {(order === 1 || order === 2) && (
          <div className="absolute left-3 top-3 flex size-9 items-center justify-center rounded-full bg-white">
            <CrownIcon
              className="size-6"
              color={order === 1 ? '#FF9526' : '#8F8F8F'}
            />
          </div>
        )}
      </div>

      <div
        className="flex flex-col justify-between rounded-b-xl p-[0.75rem_1.25rem] text-lg text-basic-500 md:h-[5.5rem] md:p-[1rem_1.5rem]"
        style={{ border: '1px solid #F3F3F3' }}
      >
        <div className="flex items-center md:h-6">
          <ShareResourceIcon className="size-5" />
          <span
            className="mx-1 pr-2"
            style={{ borderRight: '1px solid #DBDBDB' }}
          >
            分享資源
          </span>
          <span className="font-bold text-primary-base">
            {sourceCount}
            {' '}
            筆
          </span>
        </div>

        <div className="flex items-center md:h-6">
          <CommentIcon className="size-5" />
          <span
            className="mx-1 pr-2"
            style={{ borderRight: '1px solid #DBDBDB' }}
          >
            分享心得
          </span>
          <span className="font-bold text-primary-base">
            {reflectionCount}
            {' '}
            筆
          </span>
        </div>
      </div>
    </div>
  );
}
