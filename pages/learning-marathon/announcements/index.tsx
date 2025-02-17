import React from 'react';
import Button from '@/shared/components/Button';
import Nav from '@/components/Marathon/Nav';
import { AnnouncementList } from '@/components/Marathon/Announcement';
import { logEvent } from '@/utils/analytics';

const sampleAnnouncementItem = {
  id: '1',
  title:
    '【島主公告】「為什麼想做的事總是跑不起來？」，別擔心，島島盃引導師、AI、社群陪你跑五個月，跑向屬於自己的終點！',
  tags: ['實驗教育實驗教育', '實驗教育實驗教育'],
  times: '2025 / 01 / 05',
};

/** @todo Replace this with actual data */
const announcementItems = Array(5)
  .fill(sampleAnnouncementItem)
  .map((item, index) => ({
    ...item,
    id: `${index + +item.id}`,
  }));

const Announcements = () => {
  return (
    <>
      <Nav activeTab="活動公告" />

      <div className="bg-[#EEF9F9] min-h-[85dvh]">
        <div className="box pt-[72px] mx-auto w-[750px]">
          <h3 className="heading-md text-basic-500">活動公告</h3>
          <AnnouncementList items={announcementItems} />

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
