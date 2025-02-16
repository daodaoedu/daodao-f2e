import { Milestone } from "@/contexts/Milestones/type";

interface User {
  photoURL: string;
  id: string;
  name: string;
  _id: string;
  roleList: string[];
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
  milestones: Milestone[];
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
    photoURL: "",
    roleList: []
  },
  milestones: [],
};
