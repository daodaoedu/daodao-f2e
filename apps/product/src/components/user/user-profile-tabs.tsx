"use client";

import { LifeWarehouse } from "@/components/life-warehouse";
import { PracticeSection } from "@/components/practice";

interface UserProfileTabsProps {
  targetUserId: string;
  isOwnProfile: boolean;
}

export function UserProfileTabs({ targetUserId, isOwnProfile }: UserProfileTabsProps) {
  return (
    <div className="mt-4">
      {isOwnProfile && (
        <div className="mb-6">
          <LifeWarehouse />
        </div>
      )}
      <PracticeSection userId={targetUserId} />
    </div>
  );
}
