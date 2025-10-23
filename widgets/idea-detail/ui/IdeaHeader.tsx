'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Edit, Trash2, MoreVertical } from 'lucide-react';
import { Image } from '@/shared/ui/image';
import { ROLE } from '@/constants/member';
import DefaultAvatar from '@/public/assets/icons/default-avatar.svg';
import { Button } from '@/shared/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/shared/ui/alert-dialog';
import { useSession } from '@/entities/session';
import { useIdeaActions } from '@/features/ideas/hooks';
import type { IdeaSchema } from '@/services/ideas';

interface IdeaHeaderProps {
  idea: IdeaSchema;
  onEdit?: () => void;
}

export function IdeaHeader({ idea, onEdit }: IdeaHeaderProps) {
  const router = useRouter();
  const { user } = useSession();
  const { deleteIdea, isDeleting } = useIdeaActions();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // 檢查是否為想法的作者
  const isOwner = user?.id === idea.user?.id || user?.id === idea.user?._id;

  const handleEdit = () => {
    if (onEdit) {
      onEdit();
    } else {
      router.push(`/ideas/${idea.id}/edit`);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteIdea(idea.id);
      setShowDeleteDialog(false);
      toast.success('想法已刪除');
      router.push('/explore');
    } catch (error) {
      console.error('刪除想法失敗:', error);
      toast.error('刪除失敗，請稍後再試');
    }
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
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-basic-400 hover:text-basic-600"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-40">
                    <DropdownMenuItem onClick={handleEdit}>
                      <Edit className="mr-2 h-4 w-4" />
                      編輯
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setShowDeleteDialog(true)}
                      className="text-red-600 focus:text-red-600"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      刪除
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
        </header>
      </div>

      {/* 刪除確認對話框 */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>確認刪除想法</AlertDialogTitle>
            <AlertDialogDescription>
              此操作無法復原。確定要刪除這個想法嗎?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? '刪除中...' : '確認刪除'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
