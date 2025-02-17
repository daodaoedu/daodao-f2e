import React, { createContext, useContext, useState } from "react";
import {
  Milestone,
  Task
} from '@/contexts/Milestones/type';
import { BASE_URL } from "@/constants/common";
import { getTokenStorage } from "@/utils/storage";

interface MilestonesContext {
  milestones: Milestone[];
  isFetching: boolean;
  isUpdating: boolean;
  fetchMilestones: (projectId: string) => void;
  dispatchMilestone: (projectId: string, newMilestone: Partial<Milestone>) => Promise<boolean>;
  dispatchTask: (prjectId: string, milestoneId: number,newTask: Partial<Task>) => Promise<boolean>;
  deleteTask: (prjectId: string, milestoneId: number,newTask: Partial<Task>) => Promise<boolean>;
  createTask: (prjectId: string,milestoneId: number, newTask: Partial<Task>) => Promise<boolean>;
}
const ProjectContext = createContext<MilestonesContext | null>(null);

interface MilestonesContextProviderProps {
  children: React.ReactNode;
}

export function MilestonesProvider({ children }: MilestonesContextProviderProps) {
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [isFetching, setIsFetching] = useState(false);
  const [isUpdating, setIsUpdateing] = useState(false);

  const fetchMilestones = async (projectId: string) => {
    setIsFetching(true);
    try {
      const response = await fetch(`${BASE_URL}/projects/${projectId}/milestones`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const responseData: Milestone[] = await response.json();

      if (!responseData) {
        throw new Error('Invalid response structure');
      }

      const result = responseData;
      setMilestones(result);
      return result;
    } catch (error) {
      console.error('error fetching data', error);
      return [];
    } finally {
      setIsFetching(false);
    }
  };

  const dispatchMilestone = async (projectId: string, newMilestone: Partial<Milestone>): Promise<boolean> => {
    setIsUpdateing(true);
    try {
      const token = getTokenStorage().get();

      if (!token || !newMilestone?.id) return false;

      const response = await fetch(`${BASE_URL}/projects/${projectId}/milestones/${newMilestone.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ milestones, ...newMilestone })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const responseData: Milestone = await response.json();

      if (!responseData) {
        throw new Error('Invalid response structure');
      }

      const result = responseData;
      const newMilestones = milestones.map((m) => {
        return m.id === result.id ? result : m;
      });
      setMilestones([...newMilestones]);
      return true;
    } catch (error) {
      console.error('error fetching data', error);
      return false;
    } finally {
      setIsUpdateing(false);
    }
  };

  // create new task
  const createTask = async (projectId: string,milestoneId: number, newTask: Partial<Task>): Promise<boolean> => {
    setIsUpdateing(true);
    try {
      const token = getTokenStorage().get();


      if (!token) return false;

      const response = await fetch(`${BASE_URL}/projects/${projectId}/milestones/${milestoneId}/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ...newTask })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const responseData: Task = await response.json();

      if (!responseData) {
        throw new Error('Invalid response structure');
      }

      const result = responseData;

      const newMilestones = milestones.map((m) => {
        if (m.id === result.milestoneId) {
          const newTasks = [...m.tasks, result];
          return { ...m, tasks: newTasks };
        } else {
          return m;
        }
      });

      setMilestones(newMilestones);
      return true;
    } catch (error) {
      console.error('error fetching data', error);
      return false;
    } finally {
      setIsUpdateing(false);
    }
  };

  // update single task
  const dispatchTask = async (projectId: string, milestoneId: number,newTask: Partial<Task>): Promise<boolean> => {
    setIsUpdateing(true);
    try {
      const token = getTokenStorage().get();

      if (!token || !newTask?.id) return false;

      const response = await fetch(`${BASE_URL}/projects/${projectId}/milestones/${milestoneId}/tasks/${newTask.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ...newTask })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const responseData: {
        success: boolean;
        task: Task
      } = await response.json();

      if (!responseData || !responseData.task || !responseData.success) {
        throw new Error('Invalid response structure');
      }

      const result = responseData.task;
      const newMilestones = milestones.map((m) => {
        if (m.id === result.milestoneId) {
          const taskIndex = m.tasks.findIndex(t => t.id === result.id);
          if (taskIndex === -1) return m;
          
          const newTasks = [...m.tasks];
          newTasks[taskIndex] = result;
          
          return {
            ...m,
            tasks: newTasks
          };
        }
        return m;
      });

      setMilestones(newMilestones);
      return true;
    } catch (error) {
      console.error('error fetching data', error);
      return false;
    } finally {
      setIsUpdateing(false);
    }
  };

  // delete single task
  const deleteTask = async (projectId: string, milestoneId: number,newTask: Partial<Task>): Promise<boolean> => {
    setIsUpdateing(true);
    try {
      const token = getTokenStorage().get();

      if (!token || !newTask?.id) return false;

      const response = await fetch(`${BASE_URL}/projects/${projectId}/milestones/${milestoneId}/tasks/${newTask.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ...newTask })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const responseData: Task = await response.json();

      if (!responseData) {
        throw new Error('Invalid response structure');
      }

      const result = responseData;

      const newMilestones = milestones.map((m) => {
        if (m.id === result.milestoneId) {
          const newTasks = m.tasks.filter((t) => {
            return t.id !== result.id;
          });
          console.log({ ...m, tasks: newTasks });
          return { ...m, tasks: newTasks };
        } else {
          return m;
        }
      });
      setMilestones([...newMilestones]);
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
        milestones,
        isFetching,
        isUpdating,
        dispatchMilestone,
        fetchMilestones,
        createTask,
        dispatchTask,
        deleteTask
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
}

export function useMilestones() {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error("useMilestones must be used within an MilestonesProvider");
  }
  return context;
}
