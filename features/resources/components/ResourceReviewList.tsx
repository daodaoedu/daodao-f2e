import React from 'react';
import { Plus } from 'lucide-react';
import { ResourceDetailResponseSchema } from '@/services/resources/core/schema';
import { AuthGuardButton } from '@/entities/user';
import ResourceReviewCard from './ResourceReviewCard';

interface ResourceReviewListProps {
  resource: ResourceDetailResponseSchema['data'];
  onCreateReview: () => void;
}

export default function ResourceReviewList({
  resource,
  onCreateReview,
}: ResourceReviewListProps) {
  return (
    <div className="flex flex-col items-center gap-10">
      {resource.recentReviews && resource.recentReviews.length > 0 ? (
        <div className="w-full space-y-10">
          {resource.recentReviews.map((review) => (
            <ResourceReviewCard key={review.id} review={review} />
          ))}
        </div>
      ) : (
        <div className="py-12 text-center text-basic-400">
          目前還沒有人留下心得，成為第一個吧！
        </div>
      )}
      <AuthGuardButton size="lg" onClick={onCreateReview}>
        <Plus size={15} />
        分享心得
      </AuthGuardButton>
    </div>
  );
}
