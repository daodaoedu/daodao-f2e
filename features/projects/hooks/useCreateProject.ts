import toast from 'react-hot-toast';
import { useCallback, useEffect, useMemo } from 'react';
import { useRouter } from 'next/router';
import { useMyProjects } from '@/services/projects';
import useMarathonAccess from './useMarathonAccess';

const MAX_PROJECTS = 3;
const MARATHON_ACCESS_MESSAGE =
  '目前功能只開放給\n春季學習馬拉松的夥伴使用喔～';
const PROJECT_LIMIT_MESSAGE = `島上空間有限，\n計畫滿 ${MAX_PROJECTS} 個就不能再增加了><`;
const CREATE_PROJECT_PATH = '/manage/projects/create';
const PROJECTS_PATH = '/manage/projects';

export default function useCreateProject() {
  const router = useRouter();
  const { data: projects, isLoading } = useMyProjects();
  const hasMarathonAccess = useMarathonAccess();
  const isAddedDenied =
    Array.isArray(projects) && projects.length >= MAX_PROJECTS;

  const canCreateProject = useMemo(() => {
    if (!hasMarathonAccess) {
      toast.error(MARATHON_ACCESS_MESSAGE);
      return false;
    }
    if (!Array.isArray(projects) && !isLoading) {
      return false;
    }
    if (isAddedDenied) {
      toast.error(PROJECT_LIMIT_MESSAGE);
      return false;
    }
    return true;
  }, [hasMarathonAccess, projects, isLoading, isAddedDenied]);

  const handleCreateProject = useCallback(() => {
    if (canCreateProject) {
      router.push(CREATE_PROJECT_PATH);
    }
  }, [canCreateProject, router]);

  useEffect(() => {
    if (!canCreateProject && router.pathname === CREATE_PROJECT_PATH) {
      router.replace(PROJECTS_PATH);
    }
  }, [canCreateProject, router]);

  return {
    canCreateProject,
    isAddedDenied,
    handleCreateProject,
    projectLimitMessage: PROJECT_LIMIT_MESSAGE,
  };
}
