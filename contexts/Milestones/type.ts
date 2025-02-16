export interface Task {
  id: number,
  name: string,
  description: string,
  daysOfWeek: string[],
  isCompleted: boolean,
  milestoneId: number,
}

export const DEFAULT_TASK: Task = {
  id: 0,
  name: "",
  description: "",
  daysOfWeek: [],
  isCompleted: false,
  milestoneId: 0
};

export interface Milestone {
  id: number,
  project_id: "",
  week: number,
  name: string,
  description: string,
  startDate?: string,
  endDate?: string,
  isCompleted: boolean,
  isDeleted: boolean,
  createdAt: string,
  updatedAt: string,
  tasks: Task[]
}

export const DEFAULT_MILESTONE: Milestone = {
  id: 0,
  project_id: "",
  week: 1,
  name: "",
  description: "",
  startDate: "",
  endDate: "",
  isCompleted: false,
  isDeleted: false,
  createdAt: "2025-02-04T15:17:35.846Z",
  updatedAt: "2025-02-04T15:17:35.846Z",
  tasks: []
};
