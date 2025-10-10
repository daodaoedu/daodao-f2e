import { ArrowLeft } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Image } from '@/shared/ui/image';
import { ROLE } from '@/constants/member';
import DefaultAvatar from '@/public/assets/icons/default-avatar.svg';
import type { IdeaSchema } from '@/services/ideas';

interface IdeaHeaderProps {
  idea: IdeaSchema;
  onBack: () => void;
}

export function IdeaHeader({ idea, onBack }: IdeaHeaderProps) {
  return (
    <>
      {/* 返回按鈕 */}
      <Button
        variant="ghost"
        onClick={onBack}
        className="mb-4 text-basic-500 hover:text-primary-base px-0"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        返回
      </Button>

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
            </div>
          </div>
        </header>
      </div>
    </>
  );
}
