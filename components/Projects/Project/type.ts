interface User {
  id: string;
  name: string;
  _id: string;
}

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
  createdAt: string;
  strategy: string[];
  strategyDescription: string;
  resourceName: string[];
  resourceUrl: string[];
  outcome: string[];
  outcomeDescription: string;
  user: User;
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
  createdAt: "",
  strategy: [],
  strategyDescription: "",
  resourceName: [],
  resourceUrl: [],
  outcome: [],
  outcomeDescription: "",
  user: {
    id: "",
    name: "",
    _id: "",
  },
};
