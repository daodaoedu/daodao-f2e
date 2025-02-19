import React from 'react';
import Button from '@/shared/components/Button';
import Nav from '@/components/Marathon/Nav';
import { AnnouncementList } from '@/components/Marathon/Announcement';
import { logEvent } from '@/utils/analytics';

/** @todo Replace this with actual data */
import { announcementItems } from '@/fixtures/marathon/announcements';

const Announcements = () => {
  return (
    <>
      <Nav activeTab="活動公告" />

      <div className="bg-[#EEF9F9] min-h-[85dvh]">
        <div className="pt-[72px] px-4 mx-auto max-w-[750px]">
          <h3 className="heading-md text-basic-500">活動公告</h3>
          <AnnouncementList items={announcementItems} />

          {announcementItems.length > 5 && (
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
          )}
        </div>
      </div>
    </>
  );
};

export default Announcements;
