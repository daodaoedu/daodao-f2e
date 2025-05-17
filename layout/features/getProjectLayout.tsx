import { useMemo } from 'react';
import { useRouter } from 'next/router';
import { parseToString } from '@/services/core';
import { RoleEnum, useAuth } from '@/contexts/Auth';
import { ProjectProvider } from '@/contexts/Project';
import Sidebar, { SidebarItemType } from '@/layout/components/Sidebar';
import { useProject } from '@/services/modules/projects';
import NotExist from '@/shared/components/NotExist';
import ProjectHeader from '../components/ProjectHeader';
import getBaseLayout from '../core/getBaseLayout';
import getPrivateLayout from '../core/getPrivateLayout';

const ADMIN_PERMISSIONS = [
  RoleEnum.Mentor,
  RoleEnum.Admin,
  RoleEnum.SuperAdmin,
];

enum ProjectType {
  Public = 'public',
  Manage = 'manage',
  Admin = 'admin',
}

const getProjectBaseUrl = (type: ProjectType) => {
  switch (type) {
    case ProjectType.Admin:
      return '/admin/projects';
    case ProjectType.Manage:
      return '/manage/projects';
    default:
      return '/projects';
  }
};

const getBackText = (type: ProjectType) => {
  switch (type) {
    case ProjectType.Admin:
      return '返回 學習計畫管理';
    case ProjectType.Manage:
      return '返回 我的學習計畫';
    default:
      return '返回 學習計畫分享區';
  }
};

const projectRoutes = {
  detail: '/detail',
  milestones: '/milestones',
  outcomes: '/outcomes',
  notes: '/notes',
  reviews: '/reviews',
};

interface GetProjectSidebarItemsOptions {
  type: ProjectType;
  pathname: string;
  id: string | null;
}

function getProjectSidebarItems({
  type,
  pathname,
  id,
}: GetProjectSidebarItemsOptions) {
  const projectId = parseToString(id);
  const urlPrefix = getProjectBaseUrl(type);
  const query = id ? `?id=${projectId}` : '';

  const genSidebarItem = (label: string, path: string) => ({
    label,
    href: `${urlPrefix}${path}${query}`,
    isActive: pathname.startsWith(`${urlPrefix}${path}`),
  });

  const items: SidebarItemType[] = [
    genSidebarItem('學習計畫', projectRoutes.detail),
    genSidebarItem('學習里程碑', projectRoutes.milestones),
    genSidebarItem('學習成果', projectRoutes.outcomes),
    genSidebarItem('便利貼', projectRoutes.notes),
  ];

  // 公開頁面不顯示覆盤選項
  if (type !== 'public') {
    items.push(genSidebarItem('覆盤', projectRoutes.reviews));
  }

  return items;
}

const useProjectPermission = (type: ProjectType) => {
  const { pathname, query } = useRouter();
  const { user } = useAuth();
  const projectId = parseToString(query.id);
  const swr = useProject(projectId);

  const canVisit = useMemo(() => {
    const role = user?.role;
    const baseUrl = getProjectBaseUrl(type);

    switch (type) {
      case ProjectType.Admin:
        return role ? ADMIN_PERMISSIONS.includes(role) : false;
      case ProjectType.Manage:
        return swr.isLoading || swr.data?.user._id === user?._id;
      default:
        return !pathname.startsWith(`${baseUrl}${projectRoutes.reviews}`);
    }
  }, [swr, pathname, type, user]);

  return { ...swr, canVisit, projectId };
};

interface ProjectLayoutProps extends React.PropsWithChildren {
  type: ProjectType;
}

function ProjectLayout({ children, type }: ProjectLayoutProps) {
  const { pathname } = useRouter();

  const {
    data: project,
    isLoading,
    canVisit,
    projectId,
  } = useProjectPermission(type);

  const sidebarItems = getProjectSidebarItems({
    type,
    pathname,
    id: projectId,
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!canVisit || !project) {
    return <NotExist />;
  }

  return (
    <Sidebar
      items={sidebarItems}
      backPath={getProjectBaseUrl(type)}
      backText={getBackText(type)}
      showBackButton
    >
      <ProjectHeader project={project} />
      {children}
    </Sidebar>
  );
}

function getProjectLayout(type: ProjectType) {
  if (type === ProjectType.Public) {
    return (page: React.ReactElement) =>
      getBaseLayout(
        <ProjectProvider>
          <ProjectLayout type={type}>{page}</ProjectLayout>
        </ProjectProvider>
      );
  }

  return (page: React.ReactElement) =>
    getPrivateLayout(
      <ProjectProvider>
        <ProjectLayout type={type}>{page}</ProjectLayout>
      </ProjectProvider>
    );
}

export const getAdminProjectLayout = getProjectLayout(ProjectType.Admin);
export const getManageProjectLayout = getProjectLayout(ProjectType.Manage);
export const getPublicProjectLayout = getProjectLayout(ProjectType.Public);
