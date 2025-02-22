import getProjectLayout from '@/layout/ProjectLayout';
import { useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import SEOConfig from '@/shared/components/SEO';
import { Skeleton, useMediaQuery } from '@mui/material';
import { Panel, Title, ProgressBar } from '@/components/Milestones/Shared';
import { ProtectedComponent } from '@/contexts/Auth';
import { useProject } from '@/contexts/Project';
import { MilestonesProvider } from '@/contexts/Milestones/index';
import MilestoneItem from '@/components/Milestones/MilestoneItem';
import dayjs from 'dayjs';
import DateRangePicker from '@/shared/components/DateRangePicker';
import Button from '@/shared/components/Button';
import useProjectMilestoneList from '@/hooks/api/project/useProjectMilestoneList';

interface MilestonesContentProps {
  SEOData: {
    title: string;
    description: string;
    keywords: string;
    author: string;
    copyright: string;
    imgLink: string;
    link: string;
  };
}

const MilestonesContent = ({ SEOData }: MilestonesContentProps) => {
  const { project } = useProject();
  const {
    data: milestones,
    isLoading,
    mutate,
  } = useProjectMilestoneList(project.id);
  const projectId = project.id;
  const isLgScreen = useMediaQuery('(min-width: 767px)');
  const isMarathonProject = !!project.eventId;
  const [startDate, setStartDate] = useState(dayjs().startOf('day'));
  const [endDate, setEndDate] = useState(dayjs().endOf('day'));
  const [isHideCompleted, setIsHideCompleted] = useState(false);
  const [isAscending, setIsAscending] = useState(true);

  const progressValue = useMemo(() => {
    if (!Array.isArray(milestones)) return 0;

    const completedCount = milestones.filter((m) => m.isCompleted).length;
    const allCount = milestones.length;

    if (allCount === 0) return 0;
    return Math.round((completedCount / allCount) * 100);
  }, [milestones]);

  const remainingTasksCount = useMemo(() => {
    if (!Array.isArray(milestones)) return 0;

    return milestones
      .flatMap((milestone) => [...milestone.tasks])
      .filter((task) => !task.isCompleted).length;
  }, [milestones]);

  const daysRemaining = useMemo(() => {
    if (!Array.isArray(milestones)) return 0;

    const deadline = milestones
      .filter((m) => m.endDate && dayjs(m.endDate).isValid())
      .reduce<dayjs.Dayjs | null>(
        (d, m) => d && (d.isAfter(dayjs(m.endDate)) ? d : dayjs(m.endDate)),
        null
      );

    if (!deadline || dayjs().isAfter(deadline)) return 0;

    return deadline.diff(dayjs(), 'day');
  }, [milestones]);

  const sortedMilestones = useMemo(
    () =>
      Array.isArray(milestones)
        ? milestones
            .filter((m) => (isHideCompleted ? !m.isCompleted : true))
            .sort((a, b) => (isAscending ? a.week - b.week : b.week - a.week))
        : [],
    [milestones, isAscending, isHideCompleted]
  );

  return (
    <div>
      <SEOConfig data={SEOData} />
      {isLoading ? (
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
      ) : (
        <>
          <Panel className="bg-white mb-6 md:py-6 flex flex-col gap-3 md:gap-5">
            <Title title="學習里程碑進度" className="mb-0" />
            {sortedMilestones.length === 0 ? (
              <p className="font-sans text-sm md:text-base text-basic-300">
                趕快新增學習里程碑吧！
              </p>
            ) : (
              <>
                <ProgressBar progress={progressValue} />
                <p className="font-sans text-sm md:text-base text-basic-300">
                  還剩 {daysRemaining} 天可以完成剩下的 {remainingTasksCount}{' '}
                  個任務，加油！
                </p>
              </>
            )}
          </Panel>
          <Panel className="bg-white">
            <Title title="學習里程碑 *" />
            {!isMarathonProject && (
              <div className="flex justify-between items-center gap-2 pb-2.5">
                <div className="flex items-center gap-2">
                  <p>時間設定：</p>
                  <DateRangePicker
                    startDate={startDate}
                    endDate={endDate}
                    minDate={dayjs().startOf('day')}
                    onStartDateChange={setStartDate}
                    onEndDateChange={setEndDate}
                  />
                </div>
                <Button variant="solid" color="primary">
                  新增學習里程碑
                </Button>
              </div>
            )}
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                color="primary"
                onClick={() => setIsHideCompleted(!isHideCompleted)}
              >
                {isHideCompleted ? '顯示所有任務' : '隱藏已完成任務'}
              </Button>
              <Button
                variant="outline"
                color="primary"
                onClick={() => setIsAscending(!isAscending)}
              >
                {isAscending ? '新到舊' : '舊到新'}
              </Button>
            </div>
            <div className="flex flex-col gap-3">
              {sortedMilestones.map((milestone) => (
                <MilestoneItem
                  key={milestone.id}
                  milestone={milestone}
                  isLgScreen={isLgScreen}
                  projectId={projectId}
                  onRefreshData={mutate}
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
        <MilestonesContent SEOData={SEOData} />
      </MilestonesProvider>
    </ProtectedComponent>
  );
};

MilestonesPage.getLayout = (page: React.ReactElement) => getProjectLayout(page);

export default MilestonesPage;
