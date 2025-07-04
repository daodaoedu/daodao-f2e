import { MOOD_OPTIONS } from '@/constants/project';
import { ProjectReviewSchema } from '@/services/projects';
import PostPreviewCard, { BasePostData } from '@/shared/components/Post/PostPreviewCard';
import { Smile, Heart, Zap, Moon, CloudRain } from 'lucide-react';

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

  const moodOption = MOOD_OPTIONS.find(
    (option) => option.value === data.mood
  );

  const getMoodIcon = (iconName: string) => {
    const icons = {
      Smile,
      Heart,
      Zap,
      Moon,
      CloudRain,
    };
    const IconComponent = icons[iconName as keyof typeof icons];
    return IconComponent ? <IconComponent className="h-4 w-4" /> : null;
  };

  const renderContent = () => (
    <div className="mb-3.5 flex items-center gap-3">
      <p className="body-lg text-basic-500">這段時間的整體心情....</p>
      <div className="p-2 bg-basic-100 rounded flex items-center gap-2">
        {moodOption?.icon && getMoodIcon(moodOption.icon)}
        {moodOption?.label}
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
