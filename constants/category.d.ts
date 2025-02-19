// constants/category.d.ts

declare module '@/constants/category' {
  // 定義你需要的型別
  export interface MarathonLink {
    name: string;
    link: string;
    disabled?: boolean;  // 可選屬性
    external?: boolean;  // 可選屬性
  }
  export interface MenuItem {
    link: string;
    name: string;
    target?: string;
    id?: string;
  }

  // 為 MARATHON_LINKS 提供型別
  export const MARATHON_LINKS: MarathonLink[];
  export const SEARCH_TAGS: string[];  // 假設 SEARCH_TAGS 是字串陣列
  export const NAV_LINK: any;  // 根據實際狀況定義型別
  export const USER_LINK: any; // 同上
}
