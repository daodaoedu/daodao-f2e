"use client";

import { useTranslations } from "@daodao/i18n";
import { cn } from "@daodao/ui/lib/utils";
import { ArrowDown } from "lucide-react";
import type { ReactNode } from "react";

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

// 元件定義
const TimelineEventItem = ({ id, date, dayOfWeek, time, content }: TimelineEvent) => (
  <div id={id} className="mb-2 flex flex-row items-stretch justify-start gap-1 rounded-sm">
    <div className="w-[120px] shrink-0 rounded-sm bg-white p-2 text-center">
      <div className={cn("flex flex-row items-center justify-center", !time && "h-full")}>
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
        <p className="text-center text-base font-normal leading-[140%] text-[#536166]">{time}</p>
      )}
    </div>
    <div className="flex w-full flex-col items-start justify-center rounded-sm bg-white p-4 text-base font-bold leading-[140%] text-[#536166]">
      {content}
    </div>
  </div>
);

const TimelinePeriodItem = ({
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
    <h4 className="text-base font-bold leading-[140%] text-[#536166]">{title}</h4>
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

const SectionBlock = ({ title, children }: { title: string; children: ReactNode }) => (
  <div className="mb-9">
    <p className="mb-3 text-base font-normal leading-[140%] text-[#536166]">{title}</p>
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
    <p className="text-base font-normal leading-[140%] text-[#536166]">{title}</p>
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
    <p id={id} className="text-base font-normal leading-[140%] text-[#536166]">
      {`${title} （${weight}）`}
    </p>
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
  </>
);

export const ApplicationInfo = () => {
  const t = useTranslations("learning_marathon");

  const timeline2024: TimelineEvent[] = [
    { id: "event-2024-1", date: "12/16", dayOfWeek: t("day_mon"), content: t("event_plan_start_apply") },
    { id: "event-2024-2", date: "12/29", dayOfWeek: t("day_sat"), time: "15:00-16:30", content: t("event_workshop_info") },
  ];

  const timeline2025: TimelineEvent[] = [
    { id: "event-2025-1", date: "01/24", dayOfWeek: t("day_fri"), time: "23:59", content: t("event_apply_deadline") },
    { id: "event-2025-2", date: "01/27", dayOfWeek: t("day_mon"), content: t("event_selection_announcement") },
    { id: "event-2025-3", date: "02/03", dayOfWeek: t("day_mon"), time: "23:59", content: t("event_payment_deadline") },
    { id: "event-2025-4", date: "02/05", dayOfWeek: t("day_wed"), content: t("event_waitlist_announcement") },
    { id: "event-2025-5", date: "02/09", dayOfWeek: t("day_sun"), time: "14:00-15:00", content: t("event_warmup_activity") },
    { id: "event-2025-6", date: "07/12", dayOfWeek: t("day_sat"), time: "10:00-16:00", content: t("event_results_day") },
  ];

  const timelinePeriods: TimelinePeriod[] = [
    { id: "period-1", startDate: "02/09", startDayOfWeek: t("day_sun"), endDate: "07/12", endDayOfWeek: t("day_sat"), content: t("period_program_duration") },
  ];

  const schedules: ScheduleItem[] = [
    {
      id: "schedule-1",
      title: t("schedule_online_course_title"),
      items: [
        { id: "schedule-1-item-1", text: t("schedule_online_course_item_1") },
      ],
    },
    {
      id: "schedule-2",
      title: t("schedule_community_title"),
      items: [
        { id: "schedule-2-item-1", text: t("schedule_community_online") },
        { id: "schedule-2-item-2", text: t("schedule_community_inperson") },
        { id: "schedule-2-item-3", text: t("schedule_community_note") },
      ],
    },
  ];

  const applicationMethods = [
    { id: "app-method-1", text: t("app_method_1") },
    { id: "app-method-2", text: t("app_method_2") },
    { id: "app-method-3", text: t("app_method_3") },
  ];

  const evaluationCriteria: EvaluationCriteria[] = [
    {
      id: "criteria-1",
      title: t("criteria_completeness_title"),
      weight: "30%",
      items: [
        { id: "criteria-1-item-1", text: t("criteria_completeness_item_1") },
        { id: "criteria-1-item-2", text: t("criteria_completeness_item_2") },
        { id: "criteria-1-item-3", text: t("criteria_completeness_item_3") },
      ],
    },
    {
      id: "criteria-2",
      title: t("criteria_goal_title"),
      weight: "30%",
      items: [
        { id: "criteria-2-item-1", text: t("criteria_goal_item_1") },
        { id: "criteria-2-item-2", text: t("criteria_goal_item_2") },
      ],
    },
    {
      id: "criteria-3",
      title: t("criteria_resources_title"),
      weight: "20%",
      items: [
        { id: "criteria-3-item-1", text: t("criteria_resources_item_1") },
        { id: "criteria-3-item-2", text: t("criteria_resources_item_2") },
      ],
    },
    {
      id: "criteria-4",
      title: t("criteria_assessment_title"),
      weight: "20%",
      items: [
        { id: "criteria-4-item-1", text: t("criteria_assessment_item_1") },
        { id: "criteria-4-item-2", text: t("criteria_assessment_item_2") },
      ],
    },
  ];

  return (
    <div className="relative w-full max-w-full after:absolute after:right-0 after:top-[-90px] after:block after:h-[124px] after:w-[167px] after:bg-[url('/assets/learning-marathon/pen.png')] after:bg-cover after:bg-no-repeat after:content-['']">
      <SectionBlock title={t("application_info_section_schedule_title")}>
        <p className="mb-2 text-xl font-bold leading-[140%] text-[#16B9B3]">{t("application_info_schedule_title_2024")}</p>
        {timeline2024.map((event) => (
          <TimelineEventItem key={event.id} {...event} />
        ))}

        <p className="mb-2 text-xl font-bold leading-[140%] text-[#16B9B3]">{t("application_info_schedule_title_2025")}</p>
        {timeline2025.map((event) => (
          <TimelineEventItem key={event.id} {...event} />
        ))}

        {timelinePeriods.map((period) => (
          <TimelinePeriodItem key={period.id} {...period} />
        ))}

        {schedules.map((schedule) => (
          <Schedule key={schedule.id} {...schedule} />
        ))}
      </SectionBlock>

      <ListSection title={t("application_info_section_apply_method_title")} items={applicationMethods} />

      <div>
        <p className="text-base font-normal leading-[140%] text-[#536166]">{t("application_info_section_criteria_title")}</p>
        <p className="text-base font-normal leading-[140%] text-[#536166]">
          {t("application_info_criteria_desc")}
        </p>

        {evaluationCriteria.map((criterion) => (
          <EvaluationCriterion key={criterion.id} {...criterion} />
        ))}

        <p>{t("application_info_criteria_summary")}</p>
      </div>
    </div>
  );
};
