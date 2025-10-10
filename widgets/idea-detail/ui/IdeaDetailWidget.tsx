'use client';

import { useRouter } from 'next/navigation';
import { useIdea } from '@/features/ideas/hooks';
import CommentSection from '@/shared/components/Comment/CommentSection';
import { CommentType } from '@/services/comments';
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
  const { idea, isLoading, isError } = useIdea(ideaId);

  if (isLoading) {
    return <LoadingState />;
  }

  if (isError || !idea) {
    return <ErrorState onBack={() => router.push('/explore')} />;
  }

  return (
    <div className="min-h-screen bg-primary-palest pt-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-basic-white rounded-2xl p-4 md:p-8 lg:p-10 mt-6">
          <IdeaHeader idea={idea} onBack={() => router.back()} />
          <IdeaContent idea={idea} />
          <IdeaStats idea={idea} />
        </div>

        {/* 評論區塊 */}
        <div className="mt-6 bg-basic-white rounded-2xl p-4 md:p-8 lg:p-10">
          <CommentSection targetId={idea.id} targetType={CommentType.Idea} />
        </div>
      </div>
    </div>
  );
}
