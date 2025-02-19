// constants/category.d.ts

declare module '@/constants/category' {
  // 定義你需要的型別
  export interface MarathonLink {
    name: string;
    link: string;
    disabled?: boolean;  // 可選屬性
    external?: boolean;  // 可選屬性
  }

  // 為 MARATHON_LINKS 提供型別
  export const MARATHON_LINKS: MarathonLink[];
}
