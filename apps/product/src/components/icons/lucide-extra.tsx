import { createLucideIcon } from "lucide-react";

/**
 * Lucide `user-star` / `users-collaboration`：catalog 鎖定的 lucide-react 0.475 尚未收錄，
 * 以 Lucide 官方節點資料在本地定義，之後升版可直接改成從 lucide-react 匯入。
 */
export const UserStar = createLucideIcon("user-star", [
  [
    "path",
    {
      d: "M16.051 12.616a1 1 0 0 1 1.909.024l.737 1.452a1 1 0 0 0 .737.535l1.634.256a1 1 0 0 1 .588 1.806l-1.172 1.168a1 1 0 0 0-.282.866l.259 1.613a1 1 0 0 1-1.541 1.134l-1.465-.75a1 1 0 0 0-.912 0l-1.465.75a1 1 0 0 1-1.539-1.133l.258-1.613a1 1 0 0 0-.282-.866l-1.156-1.153a1 1 0 0 1 .572-1.822l1.633-.256a1 1 0 0 0 .737-.535z",
      key: "star",
    },
  ],
  ["path", { d: "M8 15H7a4 4 0 0 0-4 4v2", key: "body" }],
  ["circle", { cx: "10", cy: "7", r: "4", key: "head" }],
]);

export const UsersCollaboration = createLucideIcon("users-collaboration", [
  ["path", { d: "M12.925 3.047a9 9 0 0 1 7.616 6.11", key: "arc-top" }],
  ["path", { d: "M13 22a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2", key: "body-right" }],
  ["path", { d: "M3 12a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2", key: "body-left" }],
  ["path", { d: "M3.889 15.9a9 9 0 0 0 5.247 4.632", key: "arc-bottom" }],
  ["circle", { cx: "17", cy: "14", r: "2", key: "head-right" }],
  ["circle", { cx: "7", cy: "4", r: "2", key: "head-left" }],
]);
