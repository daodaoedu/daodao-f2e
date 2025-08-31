import { ReactNode } from 'react';
import { ArrowDown } from 'lucide-react';
import { Title, Text } from '@/components/ui/typography';
import { cn } from '@/utils/cn';

// 定義類型
type TimelineEvent = {
  id: string;
  date: string;
  dayOfWeek: string;
  time?: string;
  content: string;
};

type TimelinePeriod = {
  id: string;
  startDate: string;
  startDayOfWeek: string;
  endDate: string;
  endDayOfWeek: string;
  content: string;
};

type ScheduleItem = {
  id: string;
  title: string;
  items: Array<{
    id: string;
    text: string;
  }>;
};

type EvaluationCriteria = {
  id: string;
  title: string;
  weight: string;
  items: Array<{
    id: string;
    text: string;
  }>;
};

// 資料定義
const timeline2024: TimelineEvent[] = [
  {
    id: 'event-2024-1',
    date: '12/16',
    dayOfWeek: '一',
    content: '計畫開始申請',
  },
  {
    id: 'event-2024-2',
    date: '12/29',
    dayOfWeek: '六',
    time: '15:00-16:30',
    content: '自主學習工作坊暨說明會（線上）',
  },
];

const timeline2025: TimelineEvent[] = [
  {
    id: 'event-2025-1',
    date: '01/24',
    dayOfWeek: '五',
    time: '23:59',
    content: '申請截止',
  },
  {
    id: 'event-2025-2',
    date: '01/27',
    dayOfWeek: '一',
    content: '入選與備取公告',
  },
  {
    id: 'event-2025-3',
    date: '02/03',
    dayOfWeek: '一',
    time: '23:59',
    content: '繳費期限',
  },
  {
    id: 'event-2025-4',
    date: '02/05',
    dayOfWeek: '三',
    content: '備取遞補公告',
  },
  {
    id: 'event-2025-5',
    date: '02/09',
    dayOfWeek: '日',
    time: '14:00-15:00',
    content: '暖身活動（線上）',
  },
  {
    id: 'event-2025-6',
    date: '07/12',
    dayOfWeek: '六',
    time: '10:00-16:00',
    content: '成果分享日',
  },
];

const timelinePeriods: TimelinePeriod[] = [
  {
    id: 'period-1',
    startDate: '02/09',
    startDayOfWeek: '日',
    endDate: '07/12',
    endDayOfWeek: '六',
    content: '計畫期間',
  },
];

const schedules: ScheduleItem[] = [
  {
    id: 'schedule-1',
    title: '線上課時間',
    items: [
      {
        id: 'schedule-1-item-1',
        text: '2025/2/15（六）、2025/2/22（六）、2025/3/1（六）、2025/6/7（六）14:00-15:30',
      },
    ],
  },
  {
    id: 'schedule-2',
    title: '社群交流線上與實體時間',
    items: [
      {
        id: 'schedule-2-item-1',
        text: '線上：2/16（日）19:30-21:00、4/20（日）19:30-21:00、6/22（日）19:30-21:00',
      },
      {
        id: 'schedule-2-item-2',
        text: '實體：3/23（日）15:00-16:30 台北、5/25（日）15:00-16:30 台中',
      },
      {
        id: 'schedule-2-item-3',
        text: '地點與時間將依入選學員進行調整',
      },
    ],
  },
];

const applicationMethods = [
  {
    id: 'app-method-1',
    text: '進入島島阿學網站，點選學習馬拉松頁面「立即申請」',
  },
  { id: 'app-method-2', text: '在申請截止日前皆可修改申請內容' },
  { id: 'app-method-3', text: '入選名額：20 位' },
];

const evaluationCriteria: EvaluationCriteria[] = [
  {
    id: 'criteria-1',
    title: '計畫完整性',
    weight: '30%',
    items: [
      {
        id: 'criteria-1-item-1',
        text: '計畫簡述：願景清晰明確，具體可行，例如實現願景的步驟合理、邏輯性強，且有階段性規劃。',
      },
      {
        id: 'criteria-1-item-2',
        text: '學習動機：動機強烈且具說服力，能清楚連結個人經驗與學習主題。',
      },
      {
        id: 'criteria-1-item-3',
        text: '學習內容：學習內容具體且聚焦，與學習主題密切相關。',
      },
    ],
  },
  {
    id: 'criteria-2',
    title: '目標與方法',
    weight: '30%',
    items: [
      {
        id: 'criteria-2-item-1',
        text: '學習目標 ：目標明確、可衡量、可達成、具相關性。',
      },
      {
        id: 'criteria-2-item-2',
        text: '學習方法與策略：方法和策略多元且有效，能促進學習目標的達成。',
      },
    ],
  },
  {
    id: 'criteria-3',
    title: '資源與時程',
    weight: '20%',
    items: [
      {
        id: 'criteria-3-item-1',
        text: '學習資源：資源類型多元且可靠，包含線上線下資源、書籍、師資、社群等。',
      },
      {
        id: 'criteria-3-item-2',
        text: '學習時程表：時程安排合理，學習進度規劃明確。',
      },
    ],
  },
  {
    id: 'criteria-4',
    title: '評量與成果',
    weight: '20%',
    items: [
      {
        id: 'criteria-4-item-1',
        text: '學習評量：評量方式客觀且有效，能真實反映學習成果。',
      },
      {
        id: 'criteria-4-item-2',
        text: '學習成果呈現方式：成果呈現方式具體且多元，並與學習目標相符，能有效展現學習成果。',
      },
    ],
  },
];

// 元件定義
const TimelineEvent = ({
  id,
  date,
  dayOfWeek,
  time,
  content,
}: TimelineEvent) => (
  <div
    id={id}
    className="mb-2 flex flex-row items-stretch justify-start gap-1 rounded-sm"
  >
    <div className="w-[120px] shrink-0 rounded-sm bg-white p-2 text-center">
      <div
        className={cn(
          'flex flex-row items-center justify-center',
          !time && 'h-full'
        )}
      >
        <div className="mr-1 w-[3em] text-right text-xl font-bold leading-[140%] text-[#536166]">
          {date}
        </div>
        <div className="flex size-6 shrink-0 items-center justify-center rounded-sm bg-[#FFA10B] text-center">
          <span className="text-center text-base font-bold leading-[140%] text-white">
            {dayOfWeek}
          </span>
        </div>
      </div>
      {time && (
        <Text className="text-center text-base font-normal leading-[140%] text-[#536166]">
          {time}
        </Text>
      )}
    </div>
    <div className="flex w-full flex-col items-start justify-center rounded-sm bg-white p-4 text-base font-bold leading-[140%] text-[#536166]">
      {content}
    </div>
  </div>
);

const TimelinePeriod = ({
  id,
  startDate,
  startDayOfWeek,
  endDate,
  endDayOfWeek,
  content,
}: TimelinePeriod) => (
  <div id={id} className="mb-2 flex flex-row items-stretch justify-start gap-1 rounded-sm">
    <div className="w-[120px] shrink-0 rounded-sm bg-white p-2 text-center">
      <div className="flex flex-row items-center justify-center">
        <div className="mr-1 w-[3em] text-right text-xl font-bold leading-[140%] text-[#536166]">
          {startDate}
        </div>
        <div className="flex size-6 shrink-0 items-center justify-center rounded-sm bg-[#FFA10B] text-center">
          <span className="text-center text-base font-bold leading-[140%] text-white">
            {startDayOfWeek}
          </span>
        </div>
      </div>
      <ArrowDown className="mx-auto text-[#536166]" />
      <div className="flex flex-row items-center justify-center">
        <div className="mr-1 w-[3em] text-right text-xl font-bold leading-[140%] text-[#536166]">
          {endDate}
        </div>
        <div className="flex size-6 shrink-0 items-center justify-center rounded-sm bg-[#FFA10B] text-center">
          <span className="text-center text-base font-bold leading-[140%] text-white">
            {endDayOfWeek}
          </span>
        </div>
      </div>
    </div>
    <div className="flex w-full flex-col items-start justify-center rounded-sm bg-white p-4 text-base font-bold leading-[140%] text-[#536166]">
      {content}
    </div>
  </div>
);

const Schedule = ({ id, title, items }: ScheduleItem) => (
  <div id={id} className="mb-2 rounded-sm bg-white p-4">
    <Title
      as="h4"
      className="text-base font-bold leading-[140%] text-[#536166]"
    >
      {title}
    </Title>
    <div className="mt-2">
      <ul className="list-disc pl-6">
        {items.map((item) => (
          <li
            key={item.id}
            className="text-left text-base font-normal leading-[140%] text-[#536166]"
          >
            {item.text}
          </li>
        ))}
      </ul>
    </div>
  </div>
);

const Section = ({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) => (
  <div className="mb-9">
    <Text className="mb-3 text-base font-normal leading-[140%] text-[#536166]">
      {title}
    </Text>
    {children}
  </div>
);

const ListSection = ({
  title,
  items,
}: {
  title: string;
  items: Array<{ id: string; text: string }>;
}) => (
  <div className="mb-9">
    <Text className="text-base font-normal leading-[140%] text-[#536166]">
      {title}
    </Text>
    <div className="mt-2">
      <ul className="list-disc pl-6">
        {items.map((item) => (
          <li
            key={item.id}
            className="text-left text-base font-normal leading-[140%] text-[#536166]"
          >
            {item.text}
          </li>
        ))}
      </ul>
    </div>
  </div>
);

const EvaluationCriterion = ({ id, title, weight, items }: EvaluationCriteria) => (
  <>
    <Text id={id} className="text-base font-normal leading-[140%] text-[#536166]">
      {`${title} （${weight}）`}
    </Text>
    <div className="mt-2">
      <ul className="list-disc pl-6">
        {items.map((item) => (
          <li
            key={item.id}
            className="text-left text-base font-normal leading-[140%] text-[#536166]"
          >
            {item.text}
          </li>
        ))}
      </ul>
      <br />
    </div>
  </>
);

export default function ApplicationInfo() {
  return (
    <div className="relative w-full max-w-full after:absolute after:right-0 after:top-[-90px] after:block after:h-[124px] after:w-[167px] after:bg-[url('/assets/learning-marathon/pen.png')] after:bg-cover after:bg-no-repeat after:content-['']">
      <Section title="（一）重要時程">
        <Text className="mb-2 text-xl font-bold leading-[140%] text-[#16B9B3]">
          2024
        </Text>
        {timeline2024.map((event) => (
          <TimelineEvent key={event.id} {...event} />
        ))}

        <Text className="mb-2 text-xl font-bold leading-[140%] text-[#16B9B3]">
          2025
        </Text>
        {timeline2025.map((event) => (
          <TimelineEvent key={event.id} {...event} />
        ))}

        {timelinePeriods.map((period) => (
          <TimelinePeriod key={period.id} {...period} />
        ))}

        {schedules.map((schedule) => (
          <Schedule key={schedule.id} {...schedule} />
        ))}
      </Section>

      <ListSection title="（二）申請方式" items={applicationMethods} />

      <div>
        <Text className="text-base font-normal leading-[140%] text-[#536166]">
          （三）評選標準
        </Text>
        <Text className="text-base font-normal leading-[140%] text-[#536166]">
          為確保學習計畫的品質和有效性，評選將依據以下標準進行：
        </Text>

        {evaluationCriteria.map((criterion) => (
          <EvaluationCriterion key={criterion.id} {...criterion} />
        ))}

        <Text>
          評選委員將依據上述標準，綜合考量申請者的學習計畫，進行評分和排序。
        </Text>
      </div>
    </div>
  );
}
