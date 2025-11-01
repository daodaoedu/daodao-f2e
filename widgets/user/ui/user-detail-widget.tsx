'use client';

import {
  MailIcon,
  UserIcon,
  ShapesIcon,
  HeartIcon,
  UsersIcon,
  BriefcaseIcon,
  GraduationCapIcon,
  UserCheckIcon,
} from 'lucide-react';
import {
  UserIdentifierType,
  EDUCATION_OPTIONS,
  ROLE_OPTIONS,
  EXPERTISE_AREAS,
  INTEREST_AREAS,
  WANT_TO_DO_WITH_PARTNER,
} from '@/entities/user';
import { useUserData } from '../lib/use-user-data';

interface UserDetailWidgetProps {
  type: UserIdentifierType;
  id: string;
}

const Text = ({ children }: React.PropsWithChildren) => (
  <p className="rounded-md bg-gray-50 px-3 py-2 text-sm text-gray-900">
    {children}
  </p>
);

export function UserDetailWidget({ type, id }: UserDetailWidgetProps) {
  const { data } = useUserData({ type, id });
  const user = data?.data;

  // 現有資訊
  const email = user?.email?.trim();
  const share = Array.isArray(user?.share)
    ? user?.share.join('、')
    : user?.share?.trim();

  // 新增資訊
  const interestList = user?.interestList?.filter(Boolean) || [];
  const wantToDoList = user?.wantToDoList?.filter(Boolean) || [];
  const roleList = user?.roleList?.filter(Boolean) || [];
  const professionalField = user?.professionalField?.filter(Boolean) || [];
  const educationStage = user?.educationStage;

  // 取得選項標籤的輔助函數
  const getOptionLabel = (
    value: string,
    options: Array<{ value: string; label: string }>
  ) => {
    const option = options.find((opt) => opt.value === value);
    return option ? option.label : value;
  };

  const getEducationLabel = (value: string) => {
    return getOptionLabel(value, EDUCATION_OPTIONS);
  };

  // 檢查是否有任何資訊可顯示
  const hasAnyInfo =
    email ||
    share ||
    interestList.length > 0 ||
    wantToDoList.length > 0 ||
    roleList.length > 0 ||
    professionalField.length > 0 ||
    educationStage;

  if (!hasAnyInfo) {
    return (
      <div className="py-8 text-center">
        <UserIcon className="mx-auto mb-3 size-12 text-gray-300" />
        <p className="text-sm text-gray-500">暫無用戶資料</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 聯絡資訊 */}
      {email && (
        <div>
          <div className="mb-2 flex items-center gap-2">
            <MailIcon className="size-4 text-gray-600" />
            <h2 className="text-sm font-medium text-gray-700">電子郵件</h2>
          </div>
          <Text>{email}</Text>
        </div>
      )}

      {/* 教育階段 */}
      {educationStage && (
        <div>
          <div className="mb-2 flex items-center gap-2">
            <GraduationCapIcon className="size-4 text-gray-600" />
            <h2 className="text-sm font-medium text-gray-700">教育階段</h2>
          </div>
          <Text>{getEducationLabel(educationStage)}</Text>
        </div>
      )}

      {/* 興趣領域 */}
      {interestList.length > 0 && (
        <div>
          <div className="mb-3 flex items-center gap-2">
            <HeartIcon className="size-4 text-gray-600" />
            <h2 className="text-sm font-medium text-gray-700">興趣領域</h2>
          </div>
          <Text>
            {interestList
              .map((interest) => getOptionLabel(interest, INTEREST_AREAS))
              .join('、')}
          </Text>
        </div>
      )}

      {/* 想和夥伴一起 */}
      {wantToDoList.length > 0 && (
        <div>
          <div className="mb-3 flex items-center gap-2">
            <UsersIcon className="size-4 text-gray-600" />
            <h2 className="text-sm font-medium text-gray-700">想和夥伴一起</h2>
          </div>
          <Text>
            {wantToDoList
              .map((item) => getOptionLabel(item, WANT_TO_DO_WITH_PARTNER))
              .join('、')}
          </Text>
        </div>
      )}

      {/* 角色身份 */}
      {roleList.length > 0 && (
        <div>
          <div className="mb-3 flex items-center gap-2">
            <UserCheckIcon className="size-4 text-gray-600" />
            <h2 className="text-sm font-medium text-gray-700">角色身份</h2>
          </div>
          <Text>
            {roleList
              .map((role) => getOptionLabel(role, ROLE_OPTIONS))
              .join('、')}
          </Text>
        </div>
      )}

      {/* 專業領域 */}
      {professionalField.length > 0 && (
        <div>
          <div className="mb-3 flex items-center gap-2">
            <BriefcaseIcon className="size-4 text-gray-600" />
            <h2 className="text-sm font-medium text-gray-700">專業領域</h2>
          </div>
          <Text>
            {professionalField
              .map((field) => getOptionLabel(field, EXPERTISE_AREAS))
              .join('、')}
          </Text>
        </div>
      )}

      {/* 可分享資源 */}
      {share && (
        <div>
          <div className="mb-3 flex items-center gap-2">
            <ShapesIcon className="size-4 text-gray-600" />
            <h2 className="text-sm font-medium text-gray-700">可分享</h2>
          </div>
          <Text>{share}</Text>
        </div>
      )}
    </div>
  );
}
