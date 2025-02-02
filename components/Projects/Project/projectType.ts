export interface Project {
  _id: string;
  title: string;
  description: string;
  updatedDate: string;
  isPublic: boolean;
  motivation: string[];
  motivationDescription: string;
  goal: string;
  content: string;
  strategy: string[];
  strategyDescription: string;
  resources: string;
  outcome: string[];
  outcomeDescription: string;
}

export const DEFAULT_PROJECT: Project = {
  _id: "",
  title: "",
  description: "",
  updatedDate: "",
  isPublic: false,
  motivation: [],
  motivationDescription: "",
  goal: "",
  content: "",
  strategy: [],
  strategyDescription: "",
  resources: "",
  outcome: [],
  outcomeDescription: "",
};
