import { Milestone } from '@/contexts/Milestones/type';

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
  isPublic: boolean;
  motivation: string[];
  motivationDescription: string;
  goal: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  strategy: string[];
  strategyDescription: string;
  resourceName: string;
  resourceUrl: string[];
  outcome: string[];
  outcomeDescription: string;
  eventId: string;
  user: User;
  milestones: Milestone[];
  version: number;
}

export const DEFAULT_PROJECT: Project = {
  id: '',
  title: '',
  description: '',
  isPublic: false,
  motivation: [],
  motivationDescription: '',
  goal: '',
  content: '',
  createdAt: '',
  updatedAt: '',
  strategy: [],
  strategyDescription: '',
  resourceName: '',
  resourceUrl: [],
  outcome: [],
  outcomeDescription: '',
  eventId: '',
  user: {
    id: '',
    name: '',
    _id: '',
    photoURL: '',
    roleList: [],
  },
  milestones: [],
  version: 1,
};
