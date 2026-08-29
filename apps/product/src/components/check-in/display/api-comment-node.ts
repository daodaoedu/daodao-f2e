// 從 check-in-detail.tsx 抽出的純資料型別與 type guard。
// 獨立成 .ts 模組讓 utils/count-comments.ts 與測試不必 import .tsx 元件
// （Next.js tsconfig 的 "jsx": "preserve" 會讓 vitest 的 import-analysis 無法解析 .tsx）。
export type ApiCommentNode = {
  id: number | string;
  userId?: number | null;
  content?: string | null;
  createdAt?: string;
  replies?: unknown[];
  user?: {
    id?: string | null;
    name?: string | null;
    photoURL?: string | null;
    customId?: string | null;
  } | null;
};

export function isApiCommentNode(v: unknown): v is ApiCommentNode {
  return typeof v === "object" && v !== null && "id" in v;
}
