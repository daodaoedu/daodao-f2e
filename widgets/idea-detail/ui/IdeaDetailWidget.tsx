'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { useIdea , useIdeaActions } from '@/features/ideas/hooks';
import { BackButton } from '@/shared/ui/back-button';
import { LazyCommentSection } from '@/features/comment';
import { CommentType } from '@/services/comments';
import type { IdeaResourceSchema } from '@/services/ideas';
import { IdeaHeader } from './IdeaHeader';
import { IdeaContent } from './IdeaContent';
import { IdeaStats } from './IdeaStats';
import { LoadingState } from './LoadingState';
import { ErrorState } from './ErrorState';

interface IdeaDetailWidgetProps {
  ideaId: string;
}

export function IdeaDetailWidget({ ideaId }: IdeaDetailWidgetProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { idea, isLoading, isError, refresh } = useIdea(ideaId);
  const { updateIdea } = useIdeaActions();
  const [isEditing, setIsEditing] = useState(false);

  // 檢查 URL 參數，如果有 edit=true 則自動進入編輯模式
  useEffect(() => {
    if (searchParams?.get('edit') === 'true' && idea) {
      setIsEditing(true);
      // 移除 URL 參數，保持 URL 乾淨
      router.replace(`/ideas/${ideaId}`, { scroll: false });
    }
  }, [searchParams, idea, ideaId, router]);

  if (isLoading) {
    return <LoadingState />;
  }

  if (isError || !idea) {
    return <ErrorState onBack={() => router.push('/explore')} />;
  }

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  const handleContentSave = async (data: { content: string; tags: string[]; resources: IdeaResourceSchema[] }) => {
    try {
      await updateIdea({
        id: idea.id,
        content: data.content,
        tags: data.tags,
        ideaResources: data.resources,
      });
      await refresh(); // 重新獲取更新後的數據
      toast.success('想法更新成功!');
      setIsEditing(false);
    } catch (error) {
      console.error('更新想法失敗:', error);
      toast.error('更新想法失敗，請稍後再試');
    }
  };

  return (
    <div className="min-h-screen bg-primary-palest pt-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 返回按鈕 */}
        <BackButton
          onClick={() => router.back()}
          className="mb-6 text-basic-500 hover:text-basic-black"
        />

        {/* 主要內容 */}
        <div className="bg-basic-white rounded-2xl p-4 md:p-8 lg:p-10">
          <IdeaHeader idea={idea} onEdit={handleEdit} />
          <IdeaContent
            idea={idea}
            isEditing={isEditing}
            onSave={handleContentSave}
            onCancel={handleCancelEdit}
          />
          {!isEditing && <IdeaStats idea={idea} />}
        </div>

        {/* 評論區塊 - 編輯時隱藏 */}
        {!isEditing && (
          <div className="mt-6 bg-basic-white rounded-2xl p-4 md:p-8 lg:p-10">
            <LazyCommentSection targetId={idea.id} targetType={CommentType.Idea} hideVisibilityToggle hideCommentCount />
          </div>
        )}
      </div>
    </div>
  );
}
