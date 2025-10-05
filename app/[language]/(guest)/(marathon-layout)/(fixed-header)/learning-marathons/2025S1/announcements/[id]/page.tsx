import { Metadata } from 'next';
import { locales } from '@/shared/config/i18n';
import {
  AnnouncementDetail,
  AnnouncementList,
  announcements,
} from '@/entities/marathon';
import { BackButton } from '@/shared/ui/back-button';

export async function generateStaticParams() {
  return locales.flatMap((language) =>
    announcements.map(({ id }) => ({
      language,
      id,
    }))
  );
}

export async function generateMetadata({
  params,
}: PageProps<'/[language]/learning-marathons/2025S1/announcements/[id]'>): Promise<Metadata> {
  const { id } = await params;
  const announcement = announcements.find(({ id: itemId }) => itemId === id);

  return {
    title: announcement?.title || '找不到公告',
  };
}

export default async function LearningMarathonsAnnouncementsPage({
  params,
}: PageProps<'/[language]/learning-marathons/2025S1/announcements/[id]'>) {
  const { id } = await params;
  const announcement = announcements.find(({ id: itemId }) => itemId === id);
  const filteredAnnouncements = announcements
    .filter((item) => item.id !== id)
    .slice(0, 3);

  return (
    <div className="min-h-screen bg-[#EEF9F9] py-14">
      <div className="mx-auto max-w-[750px] px-4">
        <BackButton className="my-4" />

        {announcement ? (
          <AnnouncementDetail item={announcement} />
        ) : (
          <div className="text-center text-basic-500">找不到公告</div>
        )}
      </div>

      <div className="mx-auto max-w-[750px] px-4 pt-[72px]">
        <h3 className="heading-md text-basic-500">其他公告</h3>
        <AnnouncementList items={filteredAnnouncements} />
      </div>
    </div>
  );
}
