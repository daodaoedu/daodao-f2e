/**
 * Generated Circle Schema
 * 模擬 generated models 結構
 */
import type { CircleValidatorsCircleUserSchema } from './circleValidatorsCircleUserSchema';

export type CircleValidatorsCircleSchema = {
  _id: string;
  user: CircleValidatorsCircleUserSchema;
  title: string;
  photoURL: string;
  photoAlt: string;
  activityCategory: string[];
  category: string[];
  participator: string | number;
  area: string;
  time: string;
  partnerStyle: string;
  partnerEducationStep: string[];
  motivation: string;
  content: string;
  outcome: string;
  notice: string;
  deadline?: string;
  isNeedDeadline: boolean;
  tagList: string[];
  isGrouping: boolean;
  createdDate: string;
  updatedDate: string;
};

