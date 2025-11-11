import { z } from "zod";

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

export const baseUserSchema = z.object({
    id: z.string(),
    name: z.string(),
    photoURL: z.string(),
    roleList: z.array(z.string()),
  })

export type BaseUserSchema = z.infer<typeof baseUserSchema>;
