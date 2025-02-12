import Link from 'next/link';
import React from 'react';
import { usePromotion } from '@/contexts/Promotion';
import { GoArrowUpRight } from 'react-icons/go';
import Button from '@/shared/components/Button';

import { cn } from '@/utils/cn';
import { logEvent } from '@/utils/analytics';

const Nav = () => {
  const navItems = [
    { label: '活動詳情', href: '/learning-marathon' },
    { label: '活動公告', href: 'announcements', active: true },
    {
      label: '學習計畫分享區',
      href: '/marathon-sharing',
      disabled: true,
      external: true,
    },
    { label: '成果發表', href: '#', disabled: true },
  ];

  const { height } = usePromotion();

  return (
    <nav
      className={cn(
        'sticky z-10 bg-basic-100 text-nowrap overflow-x-auto shadow-md shadow-basic-black/10'
      )}
      style={{ top: `${height}px` }}
    >
      <ul className="max-w-[750px] mx-auto flex justify-between gap-4">
        {navItems.map((item) => (
          <li key={item.label} className="shrink-0">
            {item.disabled ? (
              <span className="block p-4 text-nowrap text-basic-300 cursor-not-allowed body-sm font-medium">
                {item.label}
              </span>
            ) : (
              <Link
                href={item.href}
                target={item.external ? '_blank' : '_self'}
                rel={item.external ? 'noopener noreferrer' : ''}
                className={cn(
                  'relative p-4 flex items-center gap-1 text-primary-base body-sm font-medium text-nowrap',
                  item.active &&
                    'before:content-[""] before:absolute before:bottom-2.5 before:left-4 before:right-4 before:h-[2px] before:bg-primary-base'
                )}
              >
                {item.label}
                {item.external && <GoArrowUpRight className="size-4" />}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </nav>
  );
};

const TagList = ({ tags }: { tags: string[] }) => {
  return (
    <div className="flex gap-2">
      {[...tags].map((tag: string) => (
        <div className="px-2.5 py-[3px] text-xs text-basic-400 bg-primary-lightest rounded-[13px]">
          {tag}
        </div>
      ))}
    </div>
  );
};

const AnnouncementList = () => {
  const sampleAnnouncementItem = {
    id: '1',
    title:
      '【島主公告】「為什麼想做的事總是跑不起來？」，別擔心，島島盃引導師、AI、社群陪你跑五個月，跑向屬於自己的終點！',
    tags: ['實驗教育實驗教育', '實驗教育實驗教育'],
    times: '2025 / 01 / 05',
  };
  const announcementItems = Array(5)
    .fill(sampleAnnouncementItem)
    .map((item, index) => ({
      ...item,
      id: `${index + +item.id}`,
    }));

  return (
    <div className="flex flex-col gap-3 my-6">
      {announcementItems.map(({ id, tags, times, title }) => (
        <Link
          href={`/learning-marathon/announcements/${id}`}
          key={id}
          className="text-start p-6 bg-white shadow-md shadow-basic-black/10 rounded-[10px] flex flex-col gap-3"
        >
          <h4 className="text-basic-400 body-sm font-normal">{title}</h4>
          <div className="flex justify-between">
            <TagList tags={tags} />
            <p className="text-basic-300 body-sm">{times}</p>
          </div>
        </Link>
      ))}
    </div>
  );
};

const Announcements = () => {
  return (
    <>
      <Nav />

      <div className="bg-[#EEF9F9] min-h-[85dvh]">
        <div className="box pt-[72px] mx-auto w-[750px]">
          <h3 className="heading-md text-basic-500">活動公告</h3>
          <AnnouncementList />

          <div className="flex justify-center">
            <Button
              className=""
              variant="solid"
              color="primary"
              size="md"
              onClick={() => logEvent('click', 'show_more_announcement')}
            >
              顯示更多
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Announcements;
