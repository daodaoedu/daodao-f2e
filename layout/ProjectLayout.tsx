import toast from 'react-hot-toast';
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { z } from 'zod';
import dayjs from 'dayjs';
import { MdLockOpen, MdLock } from 'react-icons/md';

import { ProtectedComponent } from '@/contexts/Auth';
import Button from '@/shared/components/Button';
import Container from '@/shared/components/Container';
import Sidebar from '@/shared/components/Sidebar';
import { ProjectProvider, useProject } from '@/contexts/Project';
import { ROLE } from '@/constants/member';
import { parseToString } from '@/services/core';
import getDefaultLayout from './DefaultLayout';

const idSchema = z.string().uuid();

function validateIdWithZod(id: string) {
  try {
    const result = idSchema.parse(id);
    return {
      isValid: true,
      value: result,
    };
  } catch (error) {
    return {
      isValid: false,
      error,
    };
  }
}

const tabConfigs = (projectId: string) => ({
  outcomes: {
    backText: '返回 學習成果',
    backPath: `/manage/project/outcomes?id=${projectId}`,
  },
  notes: {
    backText: '返回 便利貼',
    backPath: `/manage/project/notes?id=${projectId}`,
  },
  review: {
    backText: '返回 覆盤',
    backPath: `/manage/project/review?id=${projectId}`,
  },
});

interface ProjectLayoutContentProps {
  children: React.ReactNode;
  activeTabType?: keyof ReturnType<typeof tabConfigs>;
}

function ProjectLayout({ children, activeTabType }: ProjectLayoutContentProps) {
  const router = useRouter();
  const { pathname } = router;
  const { query } = router;
  const projectId = parseToString(query.id);
  const activeTab =
    activeTabType && projectId
      ? tabConfigs(projectId)[activeTabType]
      : undefined;
  const activeTabPath = activeTab?.backPath ?? pathname;
  const backPath = activeTab?.backPath ?? '/manage/projects';
  const backText = activeTab?.backText ?? '返回 學習計畫';
  const { project, fetchProject } = useProject();
  const zhRole = ROLE.find((r) => {
    return r.value === project.user.roleList[0];
  })?.label;
  const getProjectType = (eventId:string) => {
    switch (eventId) {
      case "2025S1":
        return "2025春季盃學習馬拉松";
      default:
        return "學習計畫";
    }
  };
  // TODO: move fetchProject to page /manage/projects
  useEffect(() => {
    if (!projectId) return;
    const validation = validateIdWithZod(projectId);
    if (!validation.isValid) return;
    fetchProject(projectId);
  }, [projectId]);

  return (
    <ProtectedComponent redirectOnCancel="/">
      <div className="bg-primary-palest">
        <Container className="pt-2 px-4 pb-12 max-w-6xl mx-auto" autoMinHeight>
          <div className="flex flex-wrap gap-x-10">
            <div className="basis-full">
              <Button
                size="sm"
                className="px-0 mb-6 lg:mb-3"
                prefixIcon="FaAngleLeft"
                onClick={() => router.push(backPath)}
              >
                {backText}
              </Button>
            </div>
            <Sidebar className="mb-6 lg:mb-0 basis-full -order-1 lg:order-none lg:basis-80">
              <Sidebar.Link
                href={
                  projectId
                    ? `/manage/project?id=${projectId}`
                    : '/manage/projects'
                }
                isActive={activeTabPath === '/manage/project'}
              >
                學習計畫
              </Sidebar.Link>
              <Sidebar.Link
                href={
                  projectId
                    ? `/manage/project/milestones?id=${projectId}`
                    : '/manage/project/milestones'
                }
                isActive={activeTabPath === '/manage/project/milestones'}
              >
                學習里程碑
              </Sidebar.Link>
              <Sidebar.Link
                href={`/manage/project/outcomes?id=${projectId}`}
                isActive={activeTabPath.startsWith('/manage/project/outcomes')}
              >
                學習成果
              </Sidebar.Link>
              <Sidebar.Link
                href={`/manage/project/notes?id=${projectId}`}
                isActive={activeTabPath.startsWith('/manage/project/notes')}
              >
                便利貼
              </Sidebar.Link>
              <Sidebar.Link
                href={`/manage/project/review?id=${projectId}`}
                isActive={activeTabPath.startsWith('/manage/project/review')}
              >
                覆盤
              </Sidebar.Link>
            </Sidebar>
            <div className="basis-full max-w-full lg:flex-1 lg:max-w-[min(760px,100%-360px)]">
              <header className="mb-6">
                <div className="mb-3 flex flex-col lg:flex-row justify-between lg:items-center gap-y-3">
                  <h1 className="heading-md text-basic-500">
                    {project?.title || '學習計畫主題名稱'}
                  </h1>
                  <div className="flex items-center justify-between lg:justify-end gap-2 text-basic-300">
                    <time>
                      {dayjs(project?.updatedAt).format('YYYY/MM/DD')}
                    </time>
                    <div className="flex items-center gap-2">
                      {/* <div className="flex items-center gap-0.5">
                        <AiOutlineEye />
                        <span>9999</span>
                      </div> */}
                      <div className="flex items-center gap-0.5">
                        {project?.isPublic ? <MdLockOpen /> : <MdLock /> }
                        <span>{project?.isPublic ? '公開' : '不公開'}</span>
                      </div>
                      {/* <div className="flex items-center gap-0.5">
                        <GoBookmark />
                        <span>2</span>
                      </div> */}
                      <Button
                        className="-m-1 p-1"
                        size="sm"
                        prefixIcon="AiOutlineMore"
                        onClick={() => toast.error('功能尚未開放')}
                      />
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 body-sm">
                  <div className="rounded-full overflow-hidden *:!block">
                    <img src={project?.user?.photoURL} alt={project?.user?.name} width="40px" height="40px" />
                  </div>
                  <div className="text-basic-400">{project?.user?.name}</div>
                  <div className="px-2.5 py-0.5 text-basic-500 bg-basic-100 rounded">
                    {zhRole}
                  </div>
                  <div className="px-2.5 py-0.5 text-basic-white bg-primary-lighter rounded">
                    {getProjectType(project.eventId)}
                  </div>
                </div>
              </header>
              {children}
            </div>
          </div>
        </Container>
      </div>
    </ProtectedComponent>
  );
}

export default function getProjectLayout(
  page: React.ReactElement,
  activeTabType?: keyof ReturnType<typeof tabConfigs>
) {
  return getDefaultLayout(
    <ProjectProvider>
      <ProjectLayout activeTabType={activeTabType}>{page}</ProjectLayout>
    </ProjectProvider>
  );
}
