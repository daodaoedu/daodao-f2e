import getProjectLayout from '@/layout/ProjectLayout';
import { useMemo, useEffect } from 'react';
import { useRouter } from 'next/router';
import SEOConfig from '@/shared/components/SEO';
import { Skeleton, useMediaQuery } from "@mui/material";
import { validateIdWithZod, Panel, Title, ProgressBar } from '@/components/Milestones/Shared';
import { ProtectedComponent } from '@/contexts/Auth';
import { useProject } from '@/contexts/Project';
import { MilestonesProvider, useMilestones } from '@/contexts/Milestones/index';
import MilestoneItem from '@/components/Milestones/MilestoneItem';
import { Task } from '@/contexts/Milestones/type';
import dayjs from 'dayjs';
import { z } from 'zod';

interface MilestonesContentProps {
  SEOData: {
    title: string;
    description: string;
    keywords: string;
    author: string;
    copyright: string;
    imgLink: string;
    link: string;
  }
}

const MilestonesContent = ({ SEOData }: MilestonesContentProps) => {
  const { project } = useProject();
  const { isFetching, milestones, fetchMilestones } = useMilestones();
  const projectId = project.id;
  const isLgScreen = useMediaQuery('(min-width: 767px)');

  useEffect(() => {
    if (!projectId) return;
    const validation = validateIdWithZod(projectId);
    if (!validation.isValid) return;
    fetchMilestones(projectId);
  }, [projectId]);

    const completedMilestonesCount = useMemo(() => {
      return milestones.filter((m) => m.isCompleted).length;
    }, [milestones]);

    const progressValue = useMemo(() => {
      return milestones.length > 0
        ? Math.round((completedMilestonesCount / milestones.length) * 100)
        : 0;
    }, [completedMilestonesCount, milestones]);

    const allTasks = useMemo(() => {
      return milestones.reduce((acc, milestone) => {
        return [...acc, ...(milestone.tasks || [])];
      }, [] as Task[]);
    }, [milestones]);

    const remainingTasksCount = useMemo(() => {
      return allTasks.filter((task) => !task.isCompleted).length;
    }, [allTasks]);

    const planDeadline = useMemo(() => {
      if (milestones.length === 0) return null;
      const endDates = milestones
        .filter((m) => m.endDate !== undefined)
        .map((m) => new Date(m.endDate ?? ''))
        .map((date) => date.getTime());
      const maxTime = Math.max(...endDates);
      return new Date(maxTime);
    }, [milestones]);

    const daysRemaining = useMemo(() => {
      // 利用 zod 檢查 planDeadline 是否為有效日期
      if (!z.date().safeParse(planDeadline).success) return 0;

      const deadline = dayjs(planDeadline);
      // 如果今天已經超過 deadline，則回傳 0
      if (dayjs().isAfter(deadline)) return 0;

      // 計算 deadline 與今天之間相差的天數
      return deadline.diff(dayjs(), 'day');
    }, [planDeadline]);

  return (
    <div>
      <SEOConfig data={SEOData} />
      {
        isFetching ? (
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
              <ProgressBar progress={progressValue} />
              <p className="font-sans text-sm md:text-base text-basic-300">
                還剩 {daysRemaining} 天可以完成剩下的 {remainingTasksCount} 個任務，加油！
              </p>
            </Panel>
            <Panel className="bg-white">
              <Title title="學習里程碑 *" />
              <div className="flex flex-col gap-3">
                {
                  milestones.length && (
                    milestones
                      .sort((a, b) => a.week - b.week)
                      .map((milestone) => (
                        <MilestoneItem
                          key={milestone.id}
                          milestone={milestone}
                          isLgScreen={isLgScreen}
                          projectId={projectId}
                        />
                      )
                      )
                  )
                }
              </div>
            </Panel>
          </>
        )
      }
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
    [router?.asPath],
  );

  return (
    <ProtectedComponent>
      <MilestonesProvider>
        <MilestonesContent SEOData={SEOData} />
      </MilestonesProvider>
    </ProtectedComponent>
  );
};

MilestonesPage.getLayout = (page: React.ReactElement) =>
  getProjectLayout(page, undefined);
export default MilestonesPage;
