import Link from 'next/link';
import React from 'react';
import Nav from '@/components/Marathon/Nav';

import { useRouter } from 'next/router';

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

const sampleAnnouncementItem = {
  author: '島小編',
  contents: [
    `學習這趟漫長的馬拉松，我可不可以用我的方式跑向屬於我的終點？
發展興趣、改變生活習慣、上理想的大學、生涯規劃、發起社會行動，
每一個生活大小事都是一場學習馬拉松。
然而，每一次的奮力前行總會遇到「不知道怎麼計畫」、「好難自律」、「沒有伴」、「資源與人脈有限」、「無限自我質疑」等難題...`,
    `島島盃學習馬拉松將提供你四大裝備：`,
    `-「專業陪跑員」陪你自我釐清與規劃路徑`,
    `-「百人社群」讓你找到合適夥伴與各界人脈`,
    `-「AI 個人化學習工具」引導你學習方向與資源並自律學習`,
    `-「專業課程」帶你掌握自主學習要領`,
    `如果你有些想做的計畫，正在等待個契機開始，現在就是時候。
五個月的馬拉松後，你將會在計畫過程中「豐富知識經驗、在學習中形塑自我、為生活與社會帶來實際行動」， 完賽不僅全額退費還有機會獲得獎助金。`,
    `島島盃 2025 春季學習馬拉松，將以學習者的自我需求出發設計學習計畫，開啟一趟自我導向學習馬拉松，往哪跑？怎麼跑？跑多快？終點在哪由你決定，島島阿學陪你一起跑。
邀請你一起「為自己重新打造喜歡的學習生活」，把自主學習變成一種生活方式，並在彼此陪伴下，成就自我與他人。`,
  ].map((content, index) => [content, index]),
  cover: 'https://fakeimg.pl/800x400/',
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

const AnnouncementList = ({
  currentPageId,
}: {
  currentPageId: string | string[] | undefined;
}) => {
  return (
    <div className="flex flex-col gap-3 my-6">
      {announcementItems
        .filter(({ id }) => id !== currentPageId)
        .filter((_, index) => index < 3)
        .map(({ id, tags, times, title }) => (
          <Link
            href={`/learning-marathon/announcements/${id}`}
            key={id}
            className="text-start p-6 bg-white shadow-md shadow-basic-black/10 rounded-[10px] flex flex-col gap-3"
          >
            <h4 className="text-basic-400 body-sm font-normal">
              {[id, title].join(' - ')}
            </h4>
            <div className="flex justify-between">
              <TagList tags={tags} />
              <p className="text-basic-300 body-sm">{times}</p>
            </div>
          </Link>
        ))}
    </div>
  );
};

const Announcement = () => {
  const router = useRouter();
  const { id } = router.query;
  const { author, contents, tags, times, title } = announcementItems.find(
    (item) => item.id === id
  ) || {
    tags: [],
  };
  return (
    <>
      <Nav activeTab="活動公告" />

      <div className="bg-[#EEF9F9] min-h-[85dvh]">
        <div className="">
          <div className="mx-auto w-[750px]">
            <Link
              href="/learning-marathon/announcements"
              className="block p-6 w-fit text-black body-sm font-medium"
            >
              {`< 返回`}
            </Link>
            <div className="bg-white h-fit p-6">
              <TagList tags={tags} />

              <h1 className="text-4xl text-basic-500 font-semibold p-6">
                {title}
              </h1>

              <p className="text-basic-300 body-sm">
                {[times, author].join(' ・ ')}
              </p>

              <img
                src="https://fakeimg.pl/800x400/"
                alt="cover"
                className="object-cover w-full h-[400px]"
              />

              {contents.map(([content, index]: [string, number]) => (
                <p key={index} className="text-basic-500 body-sm p-2">
                  {content}
                </p>
              ))}
            </div>
          </div>
        </div>

        <div className="box pt-[72px] mx-auto w-[750px]">
          <h3 className="heading-md text-basic-500">其他公告</h3>
          <AnnouncementList currentPageId={id} />
        </div>
      </div>
    </>
  );
};

export default Announcement;
