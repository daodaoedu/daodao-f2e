import React, {
  createContext, useContext, useState, useMemo,
} from 'react';
import { useSearchParams } from 'next/navigation';
import { Project, DEFAULT_PROJECT } from '@/components/Projects/Project/type';
import { BASE_URL } from '@/constants/common';
import { getTokenStorage } from '@/shared/lib/storage';
import { parseToString } from '@/shared/lib/helper';
import { useProject as useSWRProject } from '@/services/projects/core/hooks';
import { mutate } from 'swr';
import { getProjectPathname } from '@/services/projects/core/api';

interface ProjectContext {
  project: Project;
  isFetching: boolean;
  isUpdating: boolean;
  fetchProject: (projectId?: string) => void;
  dispatchProject: (newData: Partial<Project>) => Promise<boolean>;
}
const ProjectContext = createContext<ProjectContext | null>(null);

interface ProjectContextProviderProps {
  children: React.ReactNode;
}
export function ProjectProvider({ children }: ProjectContextProviderProps) {
  const [isUpdating, setIsUpdateing] = useState(false);
  const searchParams = useSearchParams();
  const projectId = parseToString(searchParams?.get('id'));

  // Use SWR hook for data fetching - this will use cached data if available
  const { data: swrProject, isLoading, mutate: mutateProject } = useSWRProject(projectId);

  // Convert SWR project data to legacy Project type
  const project = useMemo(() => {
    if (!swrProject) return DEFAULT_PROJECT;
    return swrProject as unknown as Project;
  }, [swrProject]);

  // Manual fetch function for backward compatibility (triggers SWR revalidation)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const fetchProject = (_projectId?: string) => {
    // Note: projectId param is kept for backward compatibility but not used
    // The actual projectId comes from searchParams
    mutateProject();
  };

  const dispatchProject = async (newData: Partial<Project>): Promise<boolean> => {
    setIsUpdateing(true);
    try {
      const token = getTokenStorage().get();

      if (!token || !project?.id) return false;

      const response = await fetch(`${BASE_URL}/projects/${project.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ project, ...newData }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const responseData: Project = await response.json();

      if (!responseData) {
        throw new Error('Invalid response structure');
      }

      const result = responseData;

      // Update SWR cache with new data
      mutate(getProjectPathname({ id: result.id }), result, { revalidate: false });

      return true;
    } catch (error) {
      console.error('error fetching data', error);
      return false;
    } finally {
      setIsUpdateing(false);
    }
  };

  return (
    <ProjectContext.Provider
      value={{
        project,
        isFetching: isLoading,
        isUpdating,
        dispatchProject,
        fetchProject,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
}

export function useProject() {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProject must be used within an ProjectProvider');
  }
  return context;
}
