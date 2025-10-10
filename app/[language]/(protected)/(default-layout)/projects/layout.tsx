'use client';

import { useSearchParams, usePathname } from 'next/navigation';
import { useMemo, Suspense } from 'react';
import { ProjectProvider } from '@/contexts/Project';
import Sidebar, { SidebarItemType } from '@/layout/components/Sidebar';
import { useProject } from '@/services/projects';
import NotExist from '@/shared/components/NotExist';
import ProjectHeader from '@/layout/components/ProjectHeader';
import { parseToString } from '@/utils/helper';

const projectRoutes = {
  detail: '/detail',
  milestones: '/milestones',
  outcomes: '/outcomes',
  notes: '/notes',
};

interface ProjectLayoutProps {
  children: React.ReactNode;
}

function ProjectLayoutContent({ children }: ProjectLayoutProps) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const projectId = parseToString(searchParams?.get('id'));

  const { data: project, isLoading } = useProject(projectId);

  const sidebarItems: SidebarItemType[] = useMemo(() => {
    const urlPrefix = '/projects';
    const query = projectId ? `?id=${projectId}` : '';

    return [
      {
        label: '學習計畫',
        href: `${urlPrefix}${projectRoutes.detail}${query}`,
        isActive: pathname?.startsWith(`${urlPrefix}${projectRoutes.detail}`) || false,
      },
      {
        label: '學習里程碑',
        href: `${urlPrefix}${projectRoutes.milestones}${query}`,
        isActive: pathname?.startsWith(`${urlPrefix}${projectRoutes.milestones}`) || false,
      },
      {
        label: '學習成果',
        href: `${urlPrefix}${projectRoutes.outcomes}${query}`,
        isActive: pathname?.startsWith(`${urlPrefix}${projectRoutes.outcomes}`) || false,
      },
      {
        label: '便利貼',
        href: `${urlPrefix}${projectRoutes.notes}${query}`,
        isActive: pathname?.startsWith(`${urlPrefix}${projectRoutes.notes}`) || false,
      },
    ];
  }, [projectId, pathname]);

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div>Loading...</div>
      </div>
    );
  }

  if (!project) {
    return <NotExist />;
  }

  return (
    <ProjectProvider>
      <Sidebar items={sidebarItems} backText="返回" showBackButton>
        <ProjectHeader project={project} />
        {children}
      </Sidebar>
    </ProjectProvider>
  );
}

export default function ProjectDetailLayout({ children }: ProjectLayoutProps) {
  return (
    <Suspense fallback={
      <div className="flex min-h-[400px] items-center justify-center">
        <div>Loading...</div>
      </div>
    }>
      <ProjectLayoutContent>{children}</ProjectLayoutContent>
    </Suspense>
  );
}
