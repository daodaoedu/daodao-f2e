'use client';

import { usePathname, useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { useMemo, useState } from 'react';
import { 
  getHours, 
  startOfDay, 
  addDays, 
  subDays, 
  format, 
  isAfter, 
  isBefore, 
  isSameDay, 
  isWithinInterval, 
} from 'date-fns';
import { Calendar as ShadcnCalendar } from '@/shared/ui/calendar';
import {
  ArrowUpRight,
  CalendarIcon,
  ChevronDown,
  CircleChevronRight,
  CircleChevronLeft,
} from 'lucide-react';
import Link from 'next/link';

import marathonConfig from '@/constants/marathon';

import useClickOutside from '@/shared/lib/use-click-outside';
import SEOConfig from '@/components/SEOConfig';
import { Button } from '@/shared/ui/button';
import MilestoneItem from '@/components/Milestones/MilestoneItem';
import {
  SelectProjectModal,
  MarathonAccess,
  EmptyProject,
  useMilestonesDateRange,
  ReviewForm,
  ReviewCard,
  NoteForm,
} from '@/features/projects';
import { cn } from '@/shared/lib/cn';
import OutcomeForm from '@/features/projects/components/OutcomeForm';
import AccessDeniedImg from '@/public/assets/projects/access-denied.png';
import {
  useMyProjects,
  useProjectNoteMutation,
} from '@/services/projects';
import { Image } from '@/shared/ui/image';
import useCreateProject from '@/features/projects/hooks/useCreateProject';
import MilestoneCard from '@/components/Milestones/MilestoneCard';
import {
  Accordion,
  AccordionItem,
  AccordionContent,
  AccordionTrigger,
} from '@/shared/ui/accordion';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/shared/ui/collapsible';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu';
import {
  useProjectReviewList,
  useProjectReviewMutation,
} from '@/features/projects/hooks/review';
import { useProjectOutcomeMutation } from '@/features/projects/hooks/outcome';
import { useProjectMilestoneMutation } from '@/features/projects/hooks/milestone';

const HEADER_TITLES = [
  '今天的每一小步，都在建立你的學習動能！',
  '每個挑戰都讓自己更強大！',
  '你一定可以的 - 看看你已經走了多遠！',
  '今日的努力，就是明日的能力！',
  '用自己的步調學習，才能學得更持久',
  '今天想精進哪一件小事呢？',
  '保持好奇心，就能有新發現！',
  '每次練習都在重塑你的腦力！',
  '選擇自己的學習路徑，是你的超能力！',
  '慶祝進步，而不只是完美！',
  '準備好開始今天的學習冒險了嗎？',
  '你的學習旅程是獨一無二的 - 好好把握！',
  '小小的進步累積成大大的成就！',
  '今天會發現關於自己的什麼新事物呢？',
  '你的努力塑造你的能力！',
  '學習是你的旅程 - 決定自己的步調！',
  '每個面對的挑戰都使你更強大！',
  '讓好奇心當你的指南針吧！',
  '今日的練習，造就明日的專業！',
  '你正在建立受用一生的能力！',
];

enum ModalType {
  Task,
  Review,
  Note,
  Outcome,
}

const Header = () => {
  const router = useRouter();
  const [modalType, setModalType] = useState<ModalType | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [projectId, setProjectId] = useState<string | undefined>();
  const handleCreated = () => {
    toast.success('新增成功');
    setIsOpen(false);
  };
  const { createMutation } = useProjectMilestoneMutation({
    projectId,
    onCreated: handleCreated,
  });

  const { createMutation: createReview } = useProjectReviewMutation({
    projectId,
    onCreated: handleCreated,
  });
  const { createMutation: createNote } = useProjectNoteMutation({
    projectId,
    onCreated: handleCreated,
  });
  const { createMutation: createOutcome } = useProjectOutcomeMutation({
    projectId,
    onCreated: handleCreated,
  });

  const { handleCreateProject } = useCreateProject();
  const milestonesDateRange = useMilestonesDateRange(projectId);

  const handleOpenModal = (_modalType: ModalType) => {
    setIsOpen(true);
    setModalType(_modalType);
  };

  const projectActions = [
    {
      label: '新增計畫',
      onClick: handleCreateProject,
    },
    {
      label: '新增里程碑',
      onClick: () => handleOpenModal(ModalType.Task),
    },
    {
      label: '新增覆盤',
      onClick: () => handleOpenModal(ModalType.Review),
    },
    {
      label: '新增便利貼',
      onClick: () => handleOpenModal(ModalType.Note),
    },
    {
      label: '新增成果',
      onClick: () => handleOpenModal(ModalType.Outcome),
    },
  ];

  const userActions = [
    {
      label: '新增揪團',
      onClick: () => router.push('/circles/create'),
    },
    {
      label: '新增資源',
      onClick: () => toast.error('功能尚未開放'),
    },
  ];

  const dropdownItems = [
    {
      label: '學習計畫',
      actions: projectActions,
    },
    {
      label: '個人名片',
      actions: userActions,
    },
  ];

  return (
    <div className="mb-6 p-2 flex items-center justify-between">
      <h2 className="heading-sm text-basic-500 pr-2 text-balance">
        {HEADER_TITLES[getHours(new Date()) % HEADER_TITLES.length]}
      </h2>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="default"
            className="mb-1 [&[data-state=open]>svg]:rotate-180"
          >
            新增
            <ChevronDown className="size-4 transition-transform" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="z-20">
          <Accordion type="single" collapsible>
            {dropdownItems.map(({ label, actions }) => (
              <DropdownMenuItem
                key={label}
                onClick={(e) => e.stopPropagation()}
              >
                <AccordionItem
                  value={label}
                  className="min-w-60 rounded-lg text-nowrap"
                >
                  <AccordionTrigger
                    className="w-full px-3 py-2 justify-between"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {label}
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="flex flex-col">
                      {actions.map((action) => (
                        <Button
                          key={action.label}
                          variant="ghost"
                          className="w-full justify-start ps-6"
                          onClick={action.onClick}
                        >
                          {action.label}
                        </Button>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </DropdownMenuItem>
            ))}
          </Accordion>
        </DropdownMenuContent>
      </DropdownMenu>
      <SelectProjectModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onSelect={setProjectId}
        onRemovedDOM={() => setModalType(null)}
        renderContent={(project) => (
          <>
            {modalType === ModalType.Task && (
              <MilestoneCard
                minDate={milestonesDateRange.minDate}
                maxDate={milestonesDateRange.maxDate}
                projectId={project.id}
                disabledChangeDate={!!project.eventId}
                milestones={project.milestones}
                isEditable
                defaultEditing
                onCancel={() => setIsOpen(false)}
                onCreate={createMutation.trigger}
              />
            )}
            {modalType === ModalType.Review && (
              <ReviewForm
                projectTitle={project.title}
                week={marathonConfig.getWeekNumber()}
                onSubmit={createReview.trigger}
                isLoading={createReview.isMutating}
              />
            )}
            {modalType === ModalType.Note && (
              <NoteForm
                projectTitle={project.title}
                week={marathonConfig.getWeekNumber()}
                onSubmit={createNote.trigger}
                isLoading={createNote.isMutating}
              />
            )}
            {modalType === ModalType.Outcome && (
              <OutcomeForm
                projectTitle={project.title}
                week={marathonConfig.getWeekNumber()}
                onSubmit={createOutcome.trigger}
                isLoading={createOutcome.isMutating}
              />
            )}
          </>
        )}
      />
    </div>
  );
};

interface CalendarProps {
  date: Date;
  maxDate?: Date;
  minDate?: Date;
  onChange: (date: Date) => void;
}

const Calendar = ({ date, maxDate, minDate, onChange }: CalendarProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const { ref } = useClickOutside<HTMLDivElement>({ setState: setIsOpen });

  const handleToday = () => {
    onChange(startOfDay(new Date()));
  };

  const handleChange = (value: Date | undefined) => {
    if (!value) return;
    onChange(value);
    setIsOpen(false);
  };

  return (
    <div ref={ref} className="relative">
      <div className="mb-6 pl-1 pr-3 py-2 flex flex-col sm:flex-row sm:items-center justify-between bg-white rounded-xl shadow-lg shadow-basic-200/40">
        <Button
          variant="ghost"
          className="flex gap-2 text-basic-800 bg-basic-white px-2 body-md"
          onClick={() => setIsOpen(!isOpen)}
        >
          <CalendarIcon className="size-6" />
          <div className="heading-sm">
            {format(date, 'yyyy/MM/dd')}（{format(date, 'E')}）任務
          </div>
        </Button>
        <div className="flex items-center justify-between sm:justify-start gap-0.5">
          <Button
            variant="ghost"
            className="px-3 py-2 sm:px-1 body-lg"
            onClick={handleToday}
          >
            今日
          </Button>
          <div>
            <Button
              variant="ghost"
              size="icon"
              disabled={isBefore(date, minDate || new Date()) || isSameDay(date, minDate || new Date())}
              onClick={() => onChange(subDays(date, 1))}
            >
              <CircleChevronLeft className="size-6" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              disabled={isAfter(date, maxDate || new Date()) || isSameDay(date, maxDate || new Date())}
              onClick={() => onChange(addDays(date, 1))}
            >
              <CircleChevronRight className="size-6" />
            </Button>
          </div>
        </div>
      </div>
      <div
        className={cn(
          'absolute top-full mt-1 z-20',
          'bg-basic-white shadow-lg rounded-xl',
          'transition-[transform,opacity] origin-top',
          isOpen ? 'scale-y-100 opacity-100' : 'scale-y-0 opacity-0'
        )}
      >
        <ShadcnCalendar
          mode="single"
          selected={date}
          onSelect={handleChange}
          fromDate={minDate}
          toDate={maxDate}
          initialFocus
          className="p-3"
        />
      </div>
    </div>
  );
};

interface ProjectProps {
  href: string;
  title: string;
  children: React.ReactNode;
  percentage?: number;
  defaultOpen?: boolean;
}

const Project = ({
  href,
  title,
  children,
  percentage,
  defaultOpen,
}: ProjectProps) => {
  return (
    <div
      className={cn(
        'relative mb-6 px-3 py-4 bg-white rounded-2xl',
        'after:content-[""] after:absolute after:top-0 after:left-3 after:right-3',
        'after:h-[5px] after:transition-transform after:origin-left',
        'after:scale-x-[var(--percentage)]',
        'after:bg-primary-base after:rounded-full after:z-10'
      )}
      style={{ '--percentage': `${percentage}%` } as React.CSSProperties}
    >
      <Collapsible defaultOpen={defaultOpen}>
        <CollapsibleTrigger
          className="w-full px-3 py-2 justify-between"
          withIcon
        >
          <Link
            href={href}
            target="_blank"
            className="flex items-center gap-2 body-md text-basic-500"
          >
            {title}
            <ArrowUpRight className="stroke-1" />
          </Link>
        </CollapsibleTrigger>
        <CollapsibleContent>{children}</CollapsibleContent>
      </Collapsible>
    </div>
  );
};

const TodayReviews = ({
  projectId,
  date,
}: {
  projectId: string;
  date: Date;
}) => {
  const { data: reviews } = useProjectReviewList(projectId);

  const todayReviews = useMemo(() => {
    if (!Array.isArray(reviews)) return [];
    return reviews.filter((review) => isSameDay(date, new Date(review.createdAt)));
  }, [reviews, date]);

  return (
    <ul>
      {todayReviews.map((review) => (
        <li key={review.id} className="mb-5">
          <ReviewCard
            data={review}
            detailLink={`/manage/projects/reviews/detail?id=${projectId}&reviewId=${review.id}`}
          />
        </li>
      ))}
    </ul>
  );
};

const Main = ({ date }: { date: Date }) => {
  const { data: projects, mutate } = useMyProjects();

  const { updateMutation } = useProjectMilestoneMutation();

  const todayProjects = useMemo(() => {
    if (!Array.isArray(projects)) return [];
    return projects.map((project) => ({
      ...project,
      originalMilestones: project?.milestones,
      milestones:
        project?.milestones?.filter((milestone) =>
          isWithinInterval(date, {
            start: new Date(milestone.startDate || new Date()),
            end: new Date(milestone.endDate || new Date()),
          })
        ) ?? [],
    }));
  }, [projects, date]);

  return (
    <>
      <ul>
        {todayProjects.length ? (
          todayProjects.map((project, index) => (
            <li key={project.id} className="opacity-100 transition-opacity">
              <Project
                title={project.title}
                href={`/manage/projects/detail?id=${project.id}`}
                defaultOpen={index === 0}
                percentage={
                  Array.isArray(project?.originalMilestones) &&
                  project.originalMilestones.length
                    ? (project.originalMilestones.filter((m) => m.isCompleted)
                        .length /
                        project.originalMilestones.length) *
                      100
                    : 0
                }
              >
                {Array.isArray(project?.milestones) &&
                project.milestones.length ? (
                  project.milestones.map((milestone) => (
                    <div key={milestone.id} className="mb-2 last-of-type:mb-0">
                      <MilestoneItem
                        key={milestone.id}
                        milestone={milestone}
                        milestones={project.originalMilestones}
                        projectId={project.id}
                        onRefreshData={mutate}
                        onUpdate={updateMutation.trigger}
                        isEditable
                      />
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center">
                    <div>{format(date, 'yyyy/MM/dd')} 沒有里程碑</div>
                    <Image
                      src={AccessDeniedImg.src}
                      alt="沒有里程碑"
                      width={320}
                      height={320}
                      className="object-contain h-80"
                    />
                  </div>
                )}
              </Project>
            </li>
          ))
        ) : (
          <EmptyProject />
        )}
      </ul>

      {Array.isArray(projects) &&
        projects.map((project) => (
          <TodayReviews key={project.id} projectId={project.id} date={date} />
        ))}
    </>
  );
};

export function ManagePageWidget() {
  const [date, setDate] = useState<Date>(startOfDay(new Date()));
  const pathname = usePathname();

  const SEOData = useMemo(
    () => ({
      title: '我的小島｜島島阿學',
      description:
        '「島島阿學」盼能透過建立多元的學習資源網絡，讓自主學習者能找到合適的成長方法，進一步成為自己想成為的人，從中培養共好精神。目前正積極打造「可共編的學習資源平台」。',
      keywords: '島島阿學',
      author: '島島阿學',
      copyright: '島島阿學',
      imgLink: 'https://www.daoedu.tw/assets/brand/horizontal-primary-logo.svg',
      link: `${process.env.PROD_URL}${pathname}`,
    }),
    [pathname]
  );

  return (
    <>
      <SEOConfig {...SEOData} />
      <Header />
      <Calendar
        date={date}
        onChange={setDate}
        maxDate={marathonConfig.marathonEndDate}
        minDate={marathonConfig.marathonStartDate}
      />
      <MarathonAccess>
        <Main date={date} />
      </MarathonAccess>
    </>
  );
}

