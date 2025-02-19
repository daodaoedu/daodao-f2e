// constants/category.d.ts

declare module '@/constants/category' {
  // 定義你需要的型別
  export const MARATHON_LINKS: {
    name: string;
    link: string;
    disabled?: boolean;
    external?: boolean;
  }[];
  
  export interface MenuItem {
    link: string;
    name: string;
    target?: string;
    id?: string;
  }

  export const SEARCH_TAGS: string[];  // 假設 SEARCH_TAGS 是字串陣列
  export const NAV_LINK: MenuItem[];  // 根據實際狀況定義型別
  export const USER_LINK: MenuItem[]; // 同上
}
