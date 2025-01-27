export interface Project {
  _id: string;
  title: string;
  description: string;
  updatedDate: string;
  isPublic: boolean;
  motivation: {
    tags: string[];
    description: string;
  },
  goals: string;
  content: string;
  strategies: {
    tags: string[];
    description: string;
  },
  resources: string;
  outcomes: {
    tags: string[];
    description: string
  }
}

export const DEFAULT_PROJECT: Project = {
  _id: "",
  title: "",
  description: "",
  updatedDate: "",
  isPublic: false,
  motivation: {
    tags: [],
    description: "",
  },
  goals: "",
  content: "",
  strategies: {
    tags: [],
    description: "",
  },
  resources: "",
  outcomes: {
    tags: [],
    description: ""
  }
};
