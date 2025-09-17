import { AnnouncementList } from '@/components/Marathon/Announcement';
import { announcementItems } from '@/features/marathon';

export async function generateMetadata() {
  return {
    title: '活動公告',
  };
}

export default async function LearningMarathonsAnnouncementsPage() {
  return (
    <div className="min-h-[85dvh] bg-[#EEF9F9]">
      <div className="mx-auto max-w-[750px] px-4 pt-[72px]">
        <h3 className="heading-md text-basic-500">活動公告</h3>
        <AnnouncementList items={announcementItems} />
      </div>
    </div>
  );
}
