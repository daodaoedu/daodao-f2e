export interface Project {
  id: string;
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
  resourceName: string[];
  resourceUrl: string[];
  outcome: string[];
  outcomeDescription: string;
}

export const DEFAULT_PROJECT: Project = {
  id: "",
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
  resourceName: [],
  resourceUrl: [],
  outcome: [],
  outcomeDescription: "",
};
