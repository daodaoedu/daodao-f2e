import { z } from "zod";
import { baseUserSchema } from "../_shared/schema";

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
  SuperAdmin,
}

export type BaseUserSchema = z.infer<typeof baseUserSchema>;

export const contactSchema = z
  .object({
    instagram: z.string(),
    facebook: z.string(),
    discord: z.string(),
    line: z.string(),
  })
  .refine((data) => Object.values(data).some((value) => !value), {
    message: "請至少填寫一個聯絡方式",
  });

export const userSchema = baseUserSchema.extend({
  birthDay: z
    .string({ required_error: "請選擇生日" })
    .min(1, "請選擇生日")
    .or(z.date({ required_error: "請選擇生日" })),
  gender: z.string({ required_error: "請選擇性別" }).min(1, "請選擇性別"),
  interestList: z
    .array(z.string(), {
      required_error: "請選擇 2 ～ 6 個您想要關注的學習領域",
    })
    .min(2, "最少選擇 2 個您想要關注的學習領域")
    .max(6, "最多選擇 6 個您想要關注的學習領域"),
  educationStage: z.string().min(1, "請選擇教育階段"),
  email: z.string().email("請輸入正確的Email格式"),
  location: z.string().min(1, "請輸入所在地"),
  role: z.nativeEnum(RoleEnum),
  selfIntroduction: z.string().min(1, "請輸入自我介紹"),
  share: z.string().min(1, "請輸入分享連結"),
  tagList: z.array(z.string()).min(1, "請選擇標籤"),
  wantToDoList: z.array(z.string()).min(1, "請選擇想要完成的目標"),
  isOpenLocation: z.boolean(),
  isOpenProfile: z.boolean(),
  isSubscribeEmail: z.boolean(),
  createdDate: z.string(),
  updatedDate: z.string(),
  contactList: contactSchema,
});

export const createUserFormSchema = userSchema
  .pick({
    birthDay: true,
    gender: true,
    roleList: true,
    interestList: true,
  })
  .extend({
    isSubscribeEmail: z.boolean().optional().default(true),
    isSendEmail: z.boolean().optional().nullish(),
  });

export const updateUserFormSchema = userSchema.pick({
  id: true,
  email: true,
  name: true,
  birthDay: true,
  gender: true,
  roleList: true,
  contactList: true,
  wantToDoList: true,
  educationStage: true,
  location: true,
  tagList: true,
  selfIntroduction: true,
  share: true,
  isOpenLocation: true,
  isOpenProfile: true,
});

export const userQuerySchema = z.object({
  educationStage: z.string().optional(),
  roleList: z.string().optional(),
  location: z.string().optional(),
  tag: z.string().optional(),
  search: z.string().optional(),
});

export type UserQuerySchema = z.infer<typeof userQuerySchema>;

export type UserSchema = z.infer<typeof userSchema>;

export type CreateUserFormSchema = z.infer<typeof createUserFormSchema>;

export type UpdateUserFormSchema = z.infer<typeof updateUserFormSchema>;

export type CreateUserResponse = { user: UserSchema; token: string };
