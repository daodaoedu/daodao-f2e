import toast from 'react-hot-toast';
import { useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useMyProjects } from '@/services/projects';

const MAX_PROJECTS = 3;
const PROJECT_LIMIT_MESSAGE = `島上空間有限，\n計畫滿 ${MAX_PROJECTS} 個就不能再增加了><`;
const CREATE_PROJECT_PATH = '/manage/projects/create';

export default function useCreateProject() {
  const router = useRouter();
  const { data: projects, isLoading } = useMyProjects();
  const isAddedDenied = Array.isArray(projects) && projects.length >= MAX_PROJECTS;

  const canCreateProject = useMemo(() => {
    if (!Array.isArray(projects) && !isLoading) {
      return false;
    }
    if (isAddedDenied) {
      toast.error(PROJECT_LIMIT_MESSAGE);
      return false;
    }
    return true;
  }, [projects, isLoading, isAddedDenied]);

  const handleCreateProject = useCallback(() => {
    if (canCreateProject) {
      router.push(CREATE_PROJECT_PATH);
    }
  }, [canCreateProject, router]);

  return {
    canCreateProject,
    isAddedDenied,
    handleCreateProject,
    projectLimitMessage: PROJECT_LIMIT_MESSAGE,
  };
}
