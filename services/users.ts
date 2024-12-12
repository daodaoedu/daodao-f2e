import { z } from "zod";
import http from "./http";

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

export const fetchUserProfile = async () => {
  const response = await http.get<{ data: IUser | null }>("/user/me");
  return response.data;
};

export const createUserProfileSchema = z.object({
  birthDay: z.string(),
  gender: z.string(),
  roleList: z.array(z.string()),
  isSubscribeEmail: z.boolean(),
  interestList: z.array(z.string()),
  isSendEmail: z.boolean().optional(),
});

export type CreateUserProfile = z.infer<typeof createUserProfileSchema>;

export const createUserProfile = (user: CreateUserProfile) => {
  return http.post<{ user: IUser; token: string }>(
    "/user",
    user
  );
};

export const updateUserProfileSchema = z.object({
  id: z.string(),
  email: z.string(),
  name: z.string(),
  birthDay: z.string(),
  gender: z.string(),
  roleList: z.array(z.string()),
  contactList: z.object({
    instagram: z.string(),
    facebook: z.string(),
    discord: z.string(),
    line: z.string(),
  }),
  wantToDoList: z.array(z.string()),
  educationStage: z.string(),
  location: z.string(),
  tagList: z.array(z.string()),
  selfIntroduction: z.string(),
  share: z.string(),
  isOpenLocation: z.boolean(),
  isOpenProfile: z.boolean(),
});

export type UpdateUserProfile = z.infer<typeof updateUserProfileSchema>;

export const updateUserProfile = async (user: UpdateUserProfile) => {
  const response = await http.delete<{ data: IUser }>(`/user/${user.id}`, user);
  return response.data;
};
