import { z } from 'zod';
import { baseUserSchema } from '../_shared/schema';

export enum RoleEnum {
  /** 訪客 */
  Visitor = 1,
  /** 一般使用者 */
  // User,//暫時註解，等DB資料更新完再解開
  /** 馬拉松申請者 */
  MarathonApplicant,
  /** 馬拉松參與者 */
  MarathonParticipant,
  /** 導師 */
  Mentor,
  /** 管理者 */
  Admin,
  /** 超級管理者 */
  SuperAdmin
}

export type BaseUserSchema = z.infer<typeof baseUserSchema>;

export const userQuerySchema = z.object({
  educationStage: z.string().optional(),
  roleList: z.string().optional(),
  location: z.string().optional(),
  tag: z.string().optional(),
  search: z.string().optional(),
});

export type UserQuerySchema = z.infer<typeof userQuerySchema>;

export interface IUser extends BaseUserSchema {
  _id: string;
  birthDay: string;
  educationStage: string;
  email: string;
  gender: string;
  googleID: string;
  name: string;
  photoURL: string;
  interestList: string[];
  isOpenLocation: boolean;
  isOpenProfile: boolean;
  isSubscribeEmail: boolean;
  location: string;
  roleList: string[];
  selfIntroduction: string;
  role: RoleEnum;
  share: string;
  tagList: string[];
  wantToDoList: string[];
  createdDate: Date;
  updatedDate: Date;
  contactList: {
    instagram: string;
    facebook: string;
    discord: string;
    line: string;
  };
}

export const createUserSchema = z.object({
  birthDay: z.string(),
  gender: z.string(),
  roleList: z.array(z.string()),
  isSubscribeEmail: z.boolean(),
  interestList: z.array(z.string()),
  isSendEmail: z.boolean().optional(),
});

export type CreateUserRequest = z.infer<typeof createUserSchema>;

export const updateUserSchema = z.object({
  id: z.string(),
  email: z.string().optional(),
  name: z.string().optional(),
  birthDay: z.string().optional(),
  gender: z.string().optional(),
  roleList: z.array(z.string()).optional(),
  contactList: z
    .object({
      instagram: z.string().optional(),
      facebook: z.string().optional(),
      discord: z.string().optional(),
      line: z.string().optional(),
    })
    .optional(),
  wantToDoList: z.array(z.string()).optional(),
  educationStage: z.string().optional(),
  location: z.string().optional(),
  tagList: z.array(z.string()).optional(),
  selfIntroduction: z.string().optional(),
  share: z.string().optional(),
  isOpenLocation: z.boolean().optional(),
  isOpenProfile: z.boolean().optional(),
});

export type UpdateUserRequest = z.infer<typeof updateUserSchema>;
