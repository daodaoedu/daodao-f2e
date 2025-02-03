import React, { createContext, useContext, useState } from "react";
import { Project, DEFAULT_PROJECT } from '@/components/Projects/Project/projectType';
import { BASE_URL } from "@/constants/common";
import { getTokenStorage } from "@/utils/storage";

interface ProjectContext {
  project: Project;
  isLoading: boolean;
  fetchProject: (projectId: string) => void;
  dispatchProject: (newData: Partial<Project>) => void;
}
const ProjectContext = createContext<ProjectContext | null>(null);

interface ProjectContextProviderProps {
  children: React.ReactNode;
}
export function ProjectProvider({ children }: ProjectContextProviderProps) {
  const [project, setProject] = useState(DEFAULT_PROJECT);
  const [isLoading, setIsLoading] = useState(false);

  const fetchProject = async (projectId: string) => {
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
      setIsLoading(false);
    }
  };
  const dispatchProject = async (newData: Partial<Project>) => {
    try {
      const token = getTokenStorage().get();
      console.log('token', token);
      if (!token || !project?.id) return;

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

      // json parse response data
      const result = responseData;

      // set marathon data
      setProject(result);
    } catch (error) {
      console.error('error fetching data', error);
    } finally {
      setIsLoading(false);
    }
    setProject((prev) => ({ ...prev, ...newData }));
  };

  return (
    <ProjectContext.Provider
      value={{
        project,
        isLoading,
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
