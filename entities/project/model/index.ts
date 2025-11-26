import type { ProjectSchema } from '@/services/projects/core/schema';
import type { Project } from '@/components/Projects/Project/type';

export type ProjectSearchParams = {
  page?: number;
  limit?: number;
  status?: 'Not Started' | 'Ongoing' | 'Completed' | 'Canceled';
  isPublic?: boolean;
  userId?: string;
  search?: string;
  sortBy?: 'createdAt' | 'updatedAt' | 'title' | 'startDate' | 'endDate';
  sortOrder?: 'asc' | 'desc';
};

export type ProjectListResponse = {
  data: Project[];
};

/**
 * 將 ProjectSchema 轉換為 Project 類型
 * 用於適配舊的組件接口
 */
export const transformProjectSchemaToProject = (
  project: ProjectSchema
): Project => ({
  id: project.id,
  title: project.title,
  description: project.description,
  isPublic: project.isPublic,
  motivation: project.motivation,
  motivationDescription: project.motivationDescription,
  goal: project.goal,
  content: project.content,
  createdAt: project.createdDate,
  updatedAt: project.updatedDate,
  strategy: project.strategy,
  strategyDescription: project.strategyDescription,
  resourceName: project.resourceName || '',
  resourceUrl: project.resourceUrl,
  outcome: project.outcome,
  outcomeDescription: project.outcomeDescription,
  eventId: project.eventId || '',
  user: {
    id: project.user.id,
    name: project.user.name,
    photoURL: project.user.photoURL || '',
    roleList: project.user.roleList || [],
  },
  milestones: project.milestones,
  version: project.version,
});
