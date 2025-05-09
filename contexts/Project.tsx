import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Project, DEFAULT_PROJECT } from '@/components/Projects/Project/type';
import { BASE_URL } from "@/constants/common";
import { getTokenStorage } from "@/utils/storage";
import { parseToString } from "@/services/core";

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
  const { query } = useRouter();

  const fetchProject = async (projectId: string) => {
    setIsFetching(true);
    try {
      const response = await fetch(`${BASE_URL}/projects/${projectId}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const responseData: Project = await response.json();

      if (!responseData) {
        throw new Error('Invalid response structure');
      }

      const result = responseData;
      setProject(result);
    } catch (error) {
      console.error('error fetching data', error);
    } finally {
      setIsFetching(false);
    }
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
        body: JSON.stringify({ project, ...newData })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const responseData: Project = await response.json();

      if (!responseData) {
        throw new Error('Invalid response structure');
      }

      const result = responseData;

      fetchProject(result.id);
      return true;
    } catch (error) {
      console.error('error fetching data', error);
      return false;
    } finally {
      setIsUpdateing(false);
    }
  };

  useEffect(() => {
    const projectId = parseToString(query.id);
    if (projectId) fetchProject(projectId);
  }, [query.id]);

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
    throw new Error("useProject must be used within an ProjectProvider");
  }
  return context;
}
