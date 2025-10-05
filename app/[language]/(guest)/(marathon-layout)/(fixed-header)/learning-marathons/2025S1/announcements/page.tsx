import { AnnouncementList, announcements } from '@/entities/marathon';

export async function generateMetadata() {
  return {
    title: '活動公告',
  };
}

export default async function LearningMarathonsAnnouncementsPage() {
  return (
    <div className="min-h-screen bg-[#EEF9F9]">
      <div className="mx-auto max-w-[750px] px-4 pt-[72px]">
        <h3 className="heading-md text-basic-500">活動公告</h3>
        <AnnouncementList items={announcements} />
      </div>
    </div>
  );
}
