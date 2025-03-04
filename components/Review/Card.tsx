import { EMOJI_OPTIONS } from '@/constants/project';
import { ProjectReviewSchema } from '@/services/projects/reviews';
import PostPreviewCard, { BasePostData } from '@/shared/components/Post/PostPreviewCard';

interface ReviewCardProps {
  data: ProjectReviewSchema;
  detailLink: string;
  onEditClick?: () => void;
  onDeleteClick?: () => void;
}

function ReviewCard({
  data,
  detailLink,
  onEditClick,
  onDeleteClick,
}: ReviewCardProps) {
  const reviewData: BasePostData = {
    title: data.title,
    week: data.week,
    date: data.createdAt,
  };

  const emojiOption = EMOJI_OPTIONS.find(
    (option) => option.value === data.mood
  );

  const renderContent = () => (
    <div className="mb-3.5 flex items-center gap-3">
      <p className="body-lg text-basic-500">這段時間的整體心情....</p>
      <div className="p-2 bg-basic-100 rounded">
        {emojiOption?.emoji} {emojiOption?.label}
      </div>
    </div>
  );

  return (
    <PostPreviewCard
      data={reviewData}
      tag="覆盤"
      detailLink={detailLink}
      onEditClick={onEditClick}
      onDeleteClick={onDeleteClick}
      renderContent={renderContent}
    />
  );
}

export default ReviewCard;
