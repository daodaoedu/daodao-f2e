'use client';

import { MailIcon, UserIcon, ShapesIcon } from 'lucide-react';
import { UserIdentifierType } from '@/entities/user';
import { useUserData } from '../lib/use-user-data';

interface UserDetailWidgetProps {
  type: UserIdentifierType;
  id: string;
}

export function UserDetailWidget({ type, id }: UserDetailWidgetProps) {
  const { data } = useUserData({ type, id });
  const user = data?.data;
  const email = user?.email?.trim();
  const selfIntroduction = user?.selfIntroduction?.trim();
  const share = Array.isArray(user?.share)
    ? user?.share.join(', ')
    : user?.share?.trim();

  const isEmpty = !email && !selfIntroduction && !share;

  if (isEmpty) {
    return (
      <div className="py-8 text-center">
        <UserIcon className="mx-auto mb-3 size-12 text-gray-300" />
        <p className="text-sm text-gray-500">暫無用戶資料</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {email && (
        <div>
          <div className="mb-2 flex items-center gap-2">
            <MailIcon className="size-4 text-gray-600" />
            <h2 className="text-sm font-medium text-gray-700">電子郵件</h2>
          </div>
          <p className="rounded-md bg-gray-50 px-3 py-2 text-sm text-gray-900">
            {email}
          </p>
        </div>
      )}

      {share && (
        <div>
          <div className="mb-3 flex items-center gap-2">
            <ShapesIcon className="size-4 text-gray-600" />
            <h2 className="text-sm font-medium text-gray-700">可分享</h2>
          </div>
          <p className="rounded-md bg-gray-50 px-3 py-2 text-sm leading-relaxed text-gray-900">
            {share}
          </p>
        </div>
      )}

      {selfIntroduction && (
        <div>
          <div className="mb-2 flex items-center gap-2">
            <UserIcon className="size-4 text-gray-600" />
            <h2 className="text-sm font-medium text-gray-700">自我介紹</h2>
          </div>
          <p className="rounded-md bg-gray-50 px-3 py-2 text-sm leading-relaxed text-gray-900">
            {selfIntroduction}
          </p>
        </div>
      )}
    </div>
  );
}
