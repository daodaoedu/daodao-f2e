import { z } from 'zod';
import generateService from '../serviceGenerator';

const userService = generateService('users');

export interface IUser {
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

export const getUserMe = async () => {
  const response = await userService.get<{ data: IUser | null }>('me');
  return response.data;
};

export const createUserSchema = z.object({
  birthDay: z.string(),
  gender: z.string(),
  roleList: z.array(z.string()),
  isSubscribeEmail: z.boolean(),
  interestList: z.array(z.string()),
  isSendEmail: z.boolean().optional(),
});

export type CreateUserRequest = z.infer<typeof createUserSchema>;

export const createUser = (user: CreateUserRequest) => {
  return userService.post<{ user: IUser; token: string }>('', user);
};

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

export const updateUser = async (user: UpdateUserRequest) => {
  const response = await userService.put<{ data: IUser }>(user.id, user);
  return response.data;
};
