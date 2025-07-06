import Link from 'next/link';
import React from 'react';
import Nav from '@/components/Marathon/Nav';

import { useRouter } from 'next/router';
import pageNotFound from '@/pages/404';
import {
  AnnouncementDetail,
  AnnouncementList,
} from '@/components/Marathon/Announcement';

import { announcementItems } from '@/features/marathon';

const Announcement = () => {
  const router = useRouter();
  const { id } = router.query;
  const target = announcementItems.find((item) => item.id === id);
  if (target === undefined) return pageNotFound();

  const items = announcementItems.filter((item) => item.id !== id).slice(0, 3);

  return (
    <>
      <Nav activeTab="活動公告" />

      <div className="bg-[#EEF9F9] min-h-[85dvh]">
        <div className="">
          <div className="mx-auto px-4 max-w-[750px]">
            <Link
              href="/learning-marathon/announcements"
              className="block p-6 w-fit text-black body-sm font-medium"
            >
              {`< 返回`}
            </Link>

            <AnnouncementDetail item={target} />
          </div>
        </div>

        <div className="pt-[72px] px-4 mx-auto max-w-[750px]">
          <h3 className="heading-md text-basic-500">其他公告</h3>
          <AnnouncementList items={items} />
        </div>
      </div>
    </>
  );
};

export default Announcement;
