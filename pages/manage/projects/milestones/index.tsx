import { getManageProjectLayout } from '@/layout/features/getProjectLayout';
import { useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import SEOConfig, { JsonLdType } from '@/shared/components/SEO';
import { Skeleton } from '@mui/material';
import { MdOutlineSort } from 'react-icons/md';
import { Panel, Title, ProgressBar } from '@/components/Milestones/Shared';
import { useProject } from '@/contexts/Project';
import { MilestonesProvider } from '@/contexts/Milestones/index';
import MilestoneCard, {
  MilestoneFormRef,
} from "@/components/Milestones/MilestoneCard";
import DraggableMilestones from "@/components/Milestones/DraggableMilestones";
import dayjs from "dayjs";
import { DatePickerWithRange } from "@/components/ui/date-picker";
import { Button } from "@/components/ui/button";
import { ProjectMilestoneSchema } from "@/services/projects";
import SwapRightIcon from "@/public/assets/icons/swap-right.svg";
import { useMilestonesDateRange } from "@/features/projects";
import {
  useProjectMilestoneMutation,
  useProjectMilestones,
} from "@/features/projects/hooks/milestone";

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

    return milestoneEndDate.diff(dayjs(), "day");
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
  All = "all",
  Completed = "completed",
  Incomplete = "incomplete",
}

const filterItems = [
  {
    label: "全部",
    value: FilterEnum.All,
    fn: () => true,
  },
  {
    label: "未完成",
    value: FilterEnum.Incomplete,
    fn: (milestone: ProjectMilestoneSchema) => !milestone.isCompleted,
  },
  {
    label: "已完成",
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
  const [filterType, setFilterType] = useState(FilterEnum.All);
  const [isAscending, setIsAscending] = useState(true);
  const { project } = useProject();

  const {
    data: milestones,
    isLoading,
    mutate,
  } = useProjectMilestones(project.id);

  const milestonesDateRange = useMilestonesDateRange(project.id);

  const { createMutation, updateMutation } = useProjectMilestoneMutation({
    projectId: project.id,
    updateMilestoneCache: mutate,
  });

  const projectId = project.id;
  const isMarathonProject = !!project.eventId;

  const sortedMilestones = useMemo(() => {
    if (!Array.isArray(milestones)) return [];

    const filterFn =
      filterItems.find((item) => item.value === filterType)?.fn ?? (() => true);

    const sortedData = milestones.filter(filterFn);

    return isAscending ? sortedData : [...sortedData].reverse();
  }, [milestones, isAscending, filterType]);

  const date = useMemo(() => {
    return {
      from: milestonesDateRange.startDate?.toDate(),
      to: milestonesDateRange.endDate?.toDate(),
    };
  }, [milestonesDateRange]);

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
                  <div className="flex flex-col md:flex-row justify-between md:items-center gap-2 pb-2.5">
                    <div className="flex items-center gap-2">
                      <p>時間：</p>
                      <DatePickerWithRange
                        date={date}
                        separator={
                          <SwapRightIcon className="w-4 h-4 text-basic-black/25" />
                        }
                        className="-mx-3 p-2"
                        disabled
                      />
                    </div>
                    <Button
                      variant="default"
                      className="w-full md:w-auto"
                      onClick={handleOpen}
                    >
                      新增學習里程碑
                    </Button>
                  </div>
                )}
                <div className="flex flex-col md:flex-row justify-between gap-2 pb-2.5">
                  <div>
                    顯示：
                    {filterItems.map((item) => (
                      <Button
                        key={item.value}
                        variant={
                          filterType === item.value ? "default" : "outline"
                        }
                        className="rounded-lg px-2.5 mr-2"
                        onClick={() => setFilterType(item.value)}
                      >
                        {item.label}
                      </Button>
                    ))}
                  </div>
                  <Button
                    variant="outline"
                    className="group rounded-lg px-2.5 flex items-center gap-2"
                    onClick={() => setIsAscending(!isAscending)}
                  >
                    <MdOutlineSort className="size-6 text-primary-base group-hover:text-current" />
                    {isAscending ? "舊到新" : "新到舊"}
                  </Button>
                </div>
              </>
            )}
            <div className="flex flex-col gap-3 transition-opacity">
              {isCreating && (
                <div className="p-2.5 bg-basic-100 flex flex-col gap-2 rounded-xl">
                  <MilestoneCard
                    ref={formRef}
                    minDate={milestonesDateRange.minDate}
                    maxDate={milestonesDateRange.maxDate}
                    projectId={projectId}
                    disabledChangeDate={isMarathonProject}
                    milestones={milestones}
                    isEditable
                    defaultEditing
                    onCancel={handleClose}
                    onCreate={async (request) => {
                      await createMutation.trigger(request);
                      handleClose();
                    }}
                  />
                </div>
              )}
              {Array.isArray(sortedMilestones) && (
                <DraggableMilestones
                  milestones={sortedMilestones}
                  projectId={projectId}
                  minDate={milestonesDateRange.minDate}
                  maxDate={milestonesDateRange.maxDate}
                  isAscending={isAscending}
                  onUpdate={updateMutation.trigger}
                  onReorder={updateMutation.trigger}
                  onRefreshData={mutate}
                  isEditable
                />
              )}
            </div>
          </Panel>
        </>
      )}
    </div>
  );
};

const MilestonesPage = () => {
  const router = useRouter();
  const jsonLd = useMemo<JsonLdType>(
    () => ({
      '@context': 'https://schema.org',
      '@graph': [
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
    <MilestonesProvider>
      <SEOConfig
        title="島島盃 - 2025 春季學習馬拉松｜多元學習資源平台｜島島阿學"
        description="「島島阿學」盼能透過建立多元的學習資源網絡，讓自主學習者能找到合適的成長方法，進一步成為自己想成為的人，從中培養共好精神。目前正積極打造「可共編的學習資源平台」。"
        jsonLd={jsonLd}
      />
      <MilestonesContent />
    </MilestonesProvider>
  );
};

MilestonesPage.getLayout = getManageProjectLayout;

export default MilestonesPage;
