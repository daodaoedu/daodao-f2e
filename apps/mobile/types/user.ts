/**
 * 用戶型別定義 — 對齊後端 FormattedUserResponse
 */

/** 聯絡方式（對應後端 contactList） */
export interface IContactList {
  instagram?: string | null;
  discord?: string | null;
  line?: string | null;
  facebook?: string | null;
  threads?: string | null;
  linkedin?: string | null;
  website?: string | null;
  github?: string | null;
}

/** 測驗結果（對應後端 latestQuizResult） */
export interface IUserQuizResult {
  id: number;
  resultType: string; // D/A/O/L/C
  scores: Record<string, number>;
  completedAt: string;
}

/** /users/me 回傳的用戶資料（精簡版，只保留 profile 頁面需要的欄位） */
export interface IUserProfile {
  id: string;
  name: string | null;
  email: string | null;
  photoURL: string | null;
  selfIntroduction: string | null;
  personalSlogan: string | null;
  location: string | null;
  locationNameZh: string | null;
  locationNameEn: string | null;
  contactList: IContactList | null;
  latestQuizResult: IUserQuizResult | null;
  tagList: string[] | null;
  customId: string | null;
}
