"use client";

import { PracticeSection } from "@/components/practice";

interface UserProfileTabsProps {
  targetUserId: string;
  isOwnProfile: boolean;
}

export function UserProfileTabs({ targetUserId }: UserProfileTabsProps) {
  return (
    <div className="mt-4">
      <PracticeSection userId={targetUserId} />
    </div>
  );
}
