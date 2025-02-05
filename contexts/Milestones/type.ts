export interface Task {
  id: string,
  name: string,
  description: string,
  days_of_week: string[],
  is_completed: boolean,
  milestone_id: string,
}

export const DEFAULT_TASK: Task = {
  id: "",
  name: "",
  description: "",
  days_of_week: [],
  is_completed: false,
  milestone_id: ""
};

export interface Milestone {
  id: "",
  project_id: "",
  week: number,
  name: string,
  description: string,
  start_date: string,
  end_date: string,
  is_completed: boolean,
  is_deleted: boolean,
  created_at: string,
  updated_at: string,
  createdAt: string,
  updatedAt: string,
  Tasks: Task[]
}

export const DEFAULT_MILESTONE: Milestone = {
  id: "",
  project_id: "",
  week: 1,
  name: "",
  description: "",
  start_date: "",
  end_date: "",
  is_completed: false,
  is_deleted: false,
  created_at: "2025-02-04T15:17:35.846Z",
  updated_at: "2025-02-04T15:17:35.846Z",
  createdAt: "2025-02-04T15:17:35.846Z",
  updatedAt: "2025-02-04T15:17:35.846Z",
  Tasks: []
};
