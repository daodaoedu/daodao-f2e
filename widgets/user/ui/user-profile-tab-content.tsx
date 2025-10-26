'use client';

import { UserDetailWidget } from './user-detail-widget';
import type { UserIdentifierType, UserProfileTab } from '../model/user-profile';

interface UserProfileTabContentProps {
  tabKey: UserProfileTab;
  type: UserIdentifierType;
  id: string;
}

export const UserProfileTabContent = ({
  tabKey,
  type,
  id,
}: UserProfileTabContentProps) => {
  switch (tabKey) {
    case 'profile':
      return <UserDetailWidget type={type} id={id} />;
    case 'projects':
      return <div>學習計劃</div>;
    case 'practices':
      return <div>主題實踐</div>;
    case 'ideas':
      return <div>想法</div>;
    case 'circles':
      return <div>揪團</div>;
    case 'resources':
      return <div>資源</div>;
    default:
      return null;
  }
};
