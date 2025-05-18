import React from 'react';

import Image from '@/shared/components/Image';

import ShareResourceIcon from '@/public/assets/icons/share-resource.svg';
import CommentIcon from '@/public/assets/icons/comment.svg';
import CrownIcon from '@/public/assets/icons/crown.svg';

type SharerCardProps = {
  userName?: string;
  userImg?: string;
  sourceCount?: number;
  reflectionCount?: number;
  order: number;
};

export default function SharerCard(props: SharerCardProps) {
  const {
    userName = '小許',
    userImg = 'https://fakeimg.pl/282/',
    sourceCount = 80,
    reflectionCount = 20,
    order = 1,
  } = props;

  return (
    <section className="w-[17.625rem] rounded-xl">
      <div className="relative w-full h-[17.625rem]">
        <Image
          height="inherit"
          src={userImg}
          alt="avatar"
          borderRadius="0.75rem 0.75rem 0 0"
        />
        <div className="absolute inset-0 w-full bg-gradient-to-b from-transparent to-primary-base/80" />
        <div className="absolute bottom-[0.8125rem] left-1/2 -translate-x-1/2 text-white">
          {userName}
        </div>
        {(order === 1 || order === 2) && (
          <div className="absolute w-9 h-9 bg-white top-3 left-3 flex items-center justify-center rounded-full">
            <CrownIcon
              className="w-6 h-6"
              color={order === 1 ? '#FF9526' : '#8F8F8F'}
            />
          </div>
        )}
      </div>

      <div
        className="p-[0.75rem_1.25rem] text-basic-500 text-lg flex flex-col justify-between rounded-b-xl md:p-[1rem_1.5rem] md:h-[5.5rem]"
        style={{ border: '1px solid #F3F3F3' }}
      >
        <div className="flex items-center md:h-6">
          <ShareResourceIcon className="w-5 h-5" />
          <span
            className="pr-2 mx-1"
            style={{ borderRight: '1px solid #DBDBDB' }}
          >
            分享資源
          </span>
          <span className="text-primary-base font-bold">{sourceCount} 筆</span>
        </div>

        <div className="flex items-center md:h-6">
          <CommentIcon className="w-5 h-5" />
          <span
            className="pr-2 mx-1"
            style={{ borderRight: '1px solid #DBDBDB' }}
          >
            分享心得
          </span>
          <span className="text-primary-base font-bold">
            {reflectionCount} 筆
          </span>
        </div>
      </div>
    </section>
  );
}
