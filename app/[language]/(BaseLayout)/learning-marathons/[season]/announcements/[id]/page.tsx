import { Metadata } from 'next';
import { locales } from '@/constants/i18n';
import { getDynamicRoute } from '@/utils/getDynamicRoute';
import {
  AnnouncementDetail,
  AnnouncementList,
} from '@/components/Marathon/Announcement';
import { announcementItems } from '@/features/marathon';
import Link from 'next/link';

const announcementMap = Object.fromEntries(
  announcementItems.map((item) => [item.id, item])
);

export async function generateStaticParams() {
  const season = '2025S1';

  return locales.flatMap((language) =>
    Object.keys(announcementMap).map((id) => ({
      language,
      season,
      id,
    }))
  );
}

export async function generateMetadata({
  params,
}: PageProps<'/[language]/learning-marathons/[season]/announcements/[id]'>): Promise<Metadata> {
  const { id } = await params;

  const { title } = getDynamicRoute(id, announcementMap);

  return {
    title,
  };
}

export default async function LearningMarathonsAnnouncementsPage({
  params,
}: PageProps<'/[language]/learning-marathons/[season]/announcements/[id]'>) {
  const { season, id } = await params;
  const target = getDynamicRoute(id, announcementMap);
  const items = announcementItems.filter((item) => item.id !== id).slice(0, 3);

  return (
    <div className="min-h-[85dvh] bg-[#EEF9F9]">
      <div className="">
        <div className="mx-auto max-w-[750px] px-4">
          <Link
            href={`/learning-marathons/${season}/announcements`}
            className="body-sm block w-fit p-6 font-medium text-black"
          >
            {`< 返回`}
          </Link>

          <AnnouncementDetail item={target} />
        </div>
      </div>

      <div className="mx-auto max-w-[750px] px-4 pt-[72px]">
        <h3 className="heading-md text-basic-500">其他公告</h3>
        <AnnouncementList items={items} />
      </div>
    </div>
  );
}
