import getProjectLayout from '@/layout/ProjectLayout';
import { useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import SEOConfig from '@/shared/components/SEO';
import { Skeleton } from '@mui/material';
import {
  Panel,
  Title,
  ProgressBar,
  sortMilestones,
} from '@/components/Milestones/Shared';
import { ProtectedComponent } from '@/contexts/Auth';
import { useProject } from '@/contexts/Project';
import { MilestonesProvider } from '@/contexts/Milestones/index';
import MilestoneCard, {
  MilestoneFormRef,
} from '@/components/Milestones/MilestoneCard';
import MilestoneItem from '@/components/Milestones/MilestoneItem';
import dayjs from 'dayjs';
import DateRangePicker from '@/shared/components/DateRangePicker';
import Button from '@/shared/components/Button';
import useProjectMilestoneList from '@/hooks/api/project/useProjectMilestoneList';
import { ProjectMilestoneSchema } from '@/services/project/milestone';
import CalendarIcon from '@/public/assets/icons/calendar.svg';

const SkeletonMilestones = () => {
  return (
    <>
      <Skeleton
        variant="rectangular"
        width="100%"
        height={120}
        animation="wave"
        className="mb-3"
      />
      <Skeleton
        variant="rectangular"
        width="100%"
        height={300}
        animation="wave"
      />
    </>
  );
};

interface MilestonesProgressProps {
  milestones?: ProjectMilestoneSchema[];
}

const MilestonesProgress = ({ milestones = [] }: MilestonesProgressProps) => {
  const progressValue = useMemo(() => {
    if (!Array.isArray(milestones)) return 0;

    const completedCount = milestones.filter((m) => m.isCompleted).length;
    const allCount = milestones.length;

    if (allCount === 0) return 0;
    return Math.round((completedCount / allCount) * 100);
  }, [milestones]);

  const milestoneEndDate = useMemo(() => {
    if (!Array.isArray(milestones)) return null;

    return milestones.reduce<dayjs.Dayjs | null>(
      (d, m) => (d && d.isAfter(dayjs(m.endDate)) ? d : dayjs(m.endDate)),
      null
    );
  }, [milestones]);

  const daysRemaining = useMemo(() => {
    if (!milestoneEndDate || dayjs().isAfter(milestoneEndDate)) return 0;

    return milestoneEndDate.diff(dayjs(), 'day');
  }, [milestoneEndDate]);

  const remainingMilestonesCount = useMemo(() => {
    if (!Array.isArray(milestones)) return 0;

    return milestones.filter((m) => !m.isCompleted).length;
  }, [milestones]);

  const remainingTasksCount = useMemo(() => {
    if (!Array.isArray(milestones)) return 0;

    return milestones
      .flatMap((milestone) => [...milestone.tasks])
      .filter((task) => !task.isCompleted).length;
  }, [milestones]);

  return (
    <Panel className="bg-white mb-6 md:py-6 flex flex-col gap-3 md:gap-5">
      <Title title="學習里程碑進度" className="mb-0" />
      {Array.isArray(milestones) && milestones.length > 0 ? (
        <>
          <ProgressBar progress={progressValue} />
          <p className="font-sans text-sm md:text-base text-basic-300">
            {remainingMilestonesCount === 0 ? (
              <span>恭喜你完成所有學習里程碑！</span>
            ) : (
              <span>
                還剩 {daysRemaining} 天可以完成剩下的
                {remainingTasksCount ? (
                  <span> {remainingTasksCount} 個任務</span>
                ) : (
                  <span> {remainingMilestonesCount} 個里程碑</span>
                )}
              </span>
            )}
          </p>
        </>
      ) : (
        <p className="font-sans text-sm md:text-base text-basic-300">
          趕快新增學習里程碑吧！
        </p>
      )}
    </Panel>
  );
};

enum FilterEnum {
  All = 'all',
  Completed = 'completed',
  Incomplete = 'incomplete',
}

const filterItems = [
  {
    label: '全部',
    value: FilterEnum.All,
    fn: () => true,
  },
  {
    label: '未完成',
    value: FilterEnum.Incomplete,
    fn: (milestone: ProjectMilestoneSchema) => !milestone.isCompleted,
  },
  {
    label: '已完成',
    value: FilterEnum.Completed,
    fn: (milestone: ProjectMilestoneSchema) => milestone.isCompleted,
  },
];

const useHandleShowForm = () => {
  const [isCreating, setIsCreating] = useState(false);
  const formRef = useRef<MilestoneFormRef>(null);

  const handleOpen = () => {
    setIsCreating(true);
    formRef.current?.focus();
  };

  const handleClose = () => {
    setIsCreating(false);
  };

  return { formRef, isCreating, handleOpen, handleClose };
};

const MilestonesContent = () => {
  const { formRef, isCreating, handleOpen, handleClose } = useHandleShowForm();
  const [startDate, setStartDate] = useState(dayjs().startOf('day'));
  const [endDate, setEndDate] = useState(dayjs().startOf('day').add(30, 'day'));
  const [filterType, setFilterType] = useState(FilterEnum.All);
  const [isAscending, setIsAscending] = useState(true);
  const { project } = useProject();
  const {
    data: milestones,
    isLoading,
    create,
    update,
  } = useProjectMilestoneList(project.id);

  const projectId = project.id;
  const isMarathonProject = !!project.eventId;

  const sortedMilestones = useMemo(() => {
    if (!Array.isArray(milestones)) return [];

    const filterFn =
      filterItems.find((item) => item.value === filterType)?.fn ?? (() => true);

    const sortedData = sortMilestones(milestones.filter(filterFn));

    return isAscending ? sortedData : [...sortedData].reverse();
  }, [milestones, isAscending, filterType]);

  return (
    <div>
      {isLoading ? (
        <SkeletonMilestones />
      ) : (
        <>
          <MilestonesProgress milestones={milestones} />
          <Panel className="bg-white">
            <Title title="學習里程碑 *" />
            {project && !isMarathonProject && (
              <>
                {!isMarathonProject && (
                  <div className="flex justify-between items-center gap-2 pb-2.5">
                    <div className="flex items-center gap-2">
                      <p>時間設定：</p>
                      <DateRangePicker
                        startDate={startDate}
                        endDate={endDate}
                        disabledStartDate={project.version === 2}
                        afterIcon={
                          <CalendarIcon className="w-4 h-4 text-primary-base" />
                        }
                        minDate={dayjs().startOf('day')}
                        maxDate={dayjs().add(1, 'year')}
                        onStartDateChange={setStartDate}
                        onEndDateChange={setEndDate}
                      />
                    </div>
                    <Button
                      variant="solid"
                      color="primary"
                      onClick={handleOpen}
                    >
                      新增學習里程碑
                    </Button>
                  </div>
                )}
                <div className="flex justify-between gap-2 pb-2.5">
                  <div>
                    顯示：
                    {filterItems.map((item) => (
                      <Button
                        key={item.value}
                        variant={
                          filterType === item.value ? 'solid' : 'outline'
                        }
                        color={filterType === item.value ? 'primary' : 'white'}
                        className="rounded-lg px-2.5 mr-2"
                        onClick={() => setFilterType(item.value)}
                      >
                        {item.label}
                      </Button>
                    ))}
                  </div>
                  <Button
                    variant="outline"
                    className="rounded-lg px-2.5"
                    onClick={() => setIsAscending(!isAscending)}
                  >
                    {isAscending ? '舊到新' : '新到舊'}
                  </Button>
                </div>
              </>
            )}
            <div className="flex flex-col gap-3 transition-opacity">
              {isCreating && Array.isArray(milestones) && (
                <div className="p-2.5 bg-basic-100 flex flex-col gap-2">
                  <MilestoneCard
                    ref={formRef}
                    startDate={startDate}
                    endDate={endDate}
                    projectId={projectId}
                    disabledChangeDate={isMarathonProject}
                    milestones={milestones}
                    isEditable
                    defaultEditing
                    onCancel={handleClose}
                    onCreate={async (request) => {
                      await create.trigger(request);
                      handleClose();
                    }}
                  />
                </div>
              )}
              {Array.isArray(milestones) &&
                sortedMilestones.map((milestone) => (
                  <MilestoneItem
                    key={milestone.id}
                    milestone={milestone}
                    milestones={milestones}
                    projectId={projectId}
                    startDate={startDate}
                    endDate={endDate}
                    isEditable
                    onUpdate={update.trigger}
                  />
                ))}
            </div>
          </Panel>
        </>
      )}
    </div>
  );
};

const MilestonesPage = () => {
  const router = useRouter();
  const SEOData = useMemo(
    () => ({
      title: '島島盃 - 2025 春季學習馬拉松｜多元學習資源平台｜島島阿學',
      description:
        '「島島阿學」盼能透過建立多元的學習資源網絡，讓自主學習者能找到合適的成長方法，進一步成為自己想成為的人，從中培養共好精神。目前正積極打造「可共編的學習資源平台」。',
      keywords: '島島阿學',
      author: '島島阿學',
      copyright: '島島阿學',
      imgLink: 'https://www.daoedu.tw/preview.webp',
      link: `${process.env.HOSTNAME}${router?.asPath}`,
      structuredData: [
        {
          '@context': 'https://schema.org',
          '@type': 'WebSite',
          url: 'https://www.daoedu.tw',
          potentialAction: {
            '@type': 'SearchAction',
            'query-input': 'required name=q',
            target: 'https://www.daoedu.tw/search?q={q}',
          },
        },
        {
          '@context': 'https://schema.org',
          '@type': 'Organization',
          url: 'https://www.daoedu.tw',
          logo: 'https://www.daoedu.tw/favicon-112.png',
        },
      ],
    }),
    [router?.asPath]
  );

  return (
    <ProtectedComponent>
      <MilestonesProvider>
        <SEOConfig data={SEOData} />
        <MilestonesContent />
      </MilestonesProvider>
    </ProtectedComponent>
  );
};

MilestonesPage.getLayout = getProjectLayout;

export default MilestonesPage;
