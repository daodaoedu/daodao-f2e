import React, {
  createContext, useContext, useEffect, useState,
} from 'react';
import { useSearchParams } from 'next/navigation';
import { Project, DEFAULT_PROJECT } from '@/components/Projects/Project/type';
import { projectAPIClass } from '@/services/projects/core/api';
import { mutations } from '@/utils/http';
import { parseToString } from '@/utils/helper';

interface ProjectContext {
  project: Project;
  isFetching: boolean;
  isUpdating: boolean;
  fetchProject: (projectId: string) => void;
  dispatchProject: (newData: Partial<Project>) => Promise<boolean>;
}
const ProjectContext = createContext<ProjectContext | null>(null);

interface ProjectContextProviderProps {
  children: React.ReactNode;
}
export function ProjectProvider({ children }: ProjectContextProviderProps) {
  const [project, setProject] = useState(DEFAULT_PROJECT);
  const [isFetching, setIsFetching] = useState(false);
  const [isUpdating, setIsUpdateing] = useState(false);
  const searchParams = useSearchParams();

  const fetchProject = async (projectId: string) => {
    setIsFetching(true);
    try {
      const result = await projectAPIClass.read(projectId);
      setProject(result as unknown as Project);
    } catch (error) {
      console.error('error fetching data', error);
    } finally {
      setIsFetching(false);
    }
  };
  const dispatchProject = async (newData: Partial<Project>): Promise<boolean> => {
    setIsUpdateing(true);
    try {
      if (!project?.id) return false;

      await mutations.put(`/api/v1/projects/${project.id}`, {
        ...project,
        ...newData,
      });

      fetchProject(project.id);
      return true;
    } catch (error) {
      console.error('error fetching data', error);
      return false;
    } finally {
      setIsUpdateing(false);
    }
  };

  useEffect(() => {
    const projectId = parseToString(searchParams?.get('id'));
    if (projectId) fetchProject(projectId);
  }, [searchParams]);

  return (
    <ProjectContext.Provider
      value={{
        project,
        isFetching,
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
