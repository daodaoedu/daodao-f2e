'use client';

import { useRouter } from 'next/navigation';
import { Image } from '@/shared/ui/image';
import { ROLE } from '@/constants/member';
import DefaultAvatar from '@/public/assets/icons/default-avatar.svg';
import { useSession } from '@/entities/session';
import { IdeaActions } from '@/features/ideas/components/IdeaActions';
import type { IdeaSchema } from '@/services/ideas';

interface IdeaHeaderProps {
  idea: IdeaSchema;
  onEdit?: () => void;
}

export function IdeaHeader({ idea, onEdit }: IdeaHeaderProps) {
  const router = useRouter();
  const { user } = useSession();

  // 檢查是否為想法的作者
  const isOwner = user?.id === idea.user?.id;

  const handleDeleteSuccess = () => {
    router.push('/explore');
  };

  return (
    <>
      {/* 想法內容 */}
      <div className="space-y-6">
        <header>
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
            <div className="flex items-start gap-3 flex-1">
              {idea.user?.photoURL ? (
                <Image
                  src={idea.user.photoURL}
                  alt={`${idea.user.name}'s avatar`}
                  width={40}
                  height={40}
                  className="rounded-full"
                />
              ) : (
                <div className="w-[40px] h-[40px] flex-shrink-0">
                  <DefaultAvatar />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-base text-[#536166]">
                    {idea.user?.name || '匿名用戶'}
                  </span>
                </div>
                {idea.user?.roleList?.[0] && (
                  <div className="text-sm font-normal text-[#92989A]">
                    {ROLE.find((r) => r.value === idea.user.roleList?.[0])?.label ||
                      idea.user.roleList?.[0]}
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <div className="px-3 py-1 text-xs bg-orange-400 rounded-full text-white whitespace-nowrap text-center">
                想法
              </div>
              <span className="text-sm text-[#92989A] text-center sm:text-left">
                {new Date(idea.createdAt).toLocaleDateString('zh-TW')}
              </span>

              {/* 編輯/刪除選單 - 只有作者可見 */}
              {isOwner && (
                <IdeaActions
                  idea={idea}
                  onEdit={onEdit}
                  onDeleteSuccess={handleDeleteSuccess}
                />
              )}
            </div>
          </div>
        </header>
      </div>
    </>
  );
}
