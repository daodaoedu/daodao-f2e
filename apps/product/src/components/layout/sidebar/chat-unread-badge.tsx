"use client";

import { useMyChatRooms } from "@daodao/api";

export const ChatUnreadBadge = () => {
  const { data } = useMyChatRooms();
  const count = data?.totalUnread ?? 0;
  if (count === 0) return null;

  const label = count > 99 ? "99+" : String(count);

  return (
    <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[16px] h-4 px-1 rounded-full bg-red-500 text-[10px] font-medium text-white leading-none">
      {label}
    </span>
  );
};
