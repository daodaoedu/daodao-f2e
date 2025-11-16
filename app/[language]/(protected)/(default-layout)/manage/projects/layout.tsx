'use client';

import { useMemo, Suspense } from 'react';
import { useSearchParams, usePathname } from 'next/navigation';
import { parseToString } from '@/shared/lib/helper';
import { ProjectProvider } from '@/contexts/Project';
import Sidebar, { SidebarItemType } from '@/layout/components/Sidebar';
import { useProject } from '@/services/projects';
import NotExist from '@/shared/components/NotExist';
import ProjectHeader from '@/layout/components/ProjectHeader';
import { useAuth } from '@/entities/user';

const projectRoutes = {
  detail: '/detail',
  milestones: '/milestones',
  outcomes: '/outcomes',
  notes: '/notes',
  reviews: '/reviews',
};

function getProjectSidebarItems(
  pathname: string,
  id: string | null
): SidebarItemType[] {
  const projectId = parseToString(id);
  const urlPrefix = '/manage/projects';
  const query = id ? `?id=${projectId}` : '';

  const genSidebarItem = (label: string, path: string) => {
    const fullPath = `${urlPrefix}${path}`;
    return {
      label,
      href: `${fullPath}${query}`,
      isActive: pathname.startsWith(fullPath) || pathname.includes(fullPath),
    };
  };

  return [
    genSidebarItem('學習計畫', projectRoutes.detail),
    genSidebarItem('學習里程碑', projectRoutes.milestones),
    genSidebarItem('學習成果', projectRoutes.outcomes),
    genSidebarItem('便利貼', projectRoutes.notes),
    genSidebarItem('覆盤', projectRoutes.reviews),
  ];
}

interface ProjectLayoutProps {
  children: React.ReactNode;
}

function ProjectLayoutContent({ children }: ProjectLayoutProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const projectId = parseToString(searchParams?.get('id'));

  // Skip layout for create page and index page
  // Pathname includes language prefix, so we check if it ends with the route
  const isCreatePage = pathname?.includes('/create');
  const isIndexPage =
    pathname?.endsWith('/manage/projects') || pathname === '/manage/projects';

  const { data: project, isLoading } = useProject(
    isCreatePage || isIndexPage ? null : projectId
  );

  const sidebarItems: SidebarItemType[] = useMemo(() => {
    // Normalize pathname to remove language prefix for sidebar items
    const normalizedPathname = pathname?.replace(/^\/[^/]+/, '') || '';
    return getProjectSidebarItems(
      normalizedPathname || pathname || '',
      projectId
    );
  }, [pathname, projectId]);

  // For create page and index page, skip the layout wrapper
  if (isCreatePage || isIndexPage) {
    return <>{children}</>;
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-primary-palest">
        <div>Loading...</div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-primary-palest">
        <NotExist />
      </div>
    );
  }

  // Check if user owns the project
  const canVisit = project.user.id === user?.id;

  if (!canVisit) {
    return (
      <div className="min-h-screen bg-primary-palest">
        <NotExist />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-primary-palest">
      <ProjectProvider>
        <Sidebar
          items={sidebarItems}
          backUrl="/manage/projects"
          backText="返回 我的學習計畫"
          showBackButton
        >
          <ProjectHeader project={project} />
          {children}
        </Sidebar>
      </ProjectProvider>
    </div>
  );
}

export default function ManageProjectLayout({ children }: ProjectLayoutProps) {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[400px] items-center justify-center">
          <div>Loading...</div>
        </div>
      }
    >
      <ProjectLayoutContent>{children}</ProjectLayoutContent>
    </Suspense>
  );
}
