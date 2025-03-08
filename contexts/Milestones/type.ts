export interface Task {
  id: number,
  name: string,
  daysOfWeek: string[],
  isCompleted: boolean,
  milestoneId: number,
  position: number,
}

export const DEFAULT_TASK: Task = {
  id: 0,
  name: "",
  daysOfWeek: [],
  isCompleted: false,
  milestoneId: 0,
  position: 1000,
};

export interface Milestone {
  id: number,
  projectId: string,
  position: number,
  name: string,
  startDate: string,
  endDate: string,
  isCompleted: boolean,
  isDeleted: boolean,
  createdAt: string,
  updatedAt: string,
  tasks: Task[]
}

export const DEFAULT_MILESTONE: Milestone = {
  id: 0,
  projectId: "",
  position: 1000,
  name: "",
  startDate: "",
  endDate: "",
  isCompleted: false,
  isDeleted: false,
  createdAt: "2025-02-04T15:17:35.846Z",
  updatedAt: "2025-02-04T15:17:35.846Z",
  tasks: []
};
