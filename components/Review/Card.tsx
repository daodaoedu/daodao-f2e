import dayjs from 'dayjs';
import { EMOJI_OPTIONS } from '@/constants/project';
import Button from '@/shared/components/Button';
import PostCard from '@/shared/components/Post/PostCard';
import { ProjectReviewSchema } from '@/services/project/reviews';
import numberToChineseNumber from '@/utils/numberToChineseNumber';

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
  const emojiOption = EMOJI_OPTIONS.find(
    (option) => option.value === data.mood
  );

  return (
    <PostCard>
      <PostCard.Header
        title={data.title}
        subtitle={`第${numberToChineseNumber(data.week)}週`}
        tag="覆盤"
        date={dayjs(data.createdAt).format('YYYY/MM/DD')}
        dropdownItems={[
          {
            key: 'edit',
            children: (
              <Button size="sm" onClick={onEditClick}>
                編輯
              </Button>
            ),
          },
          {
            key: 'delete',
            children: (
              <Button size="sm" onClick={onDeleteClick}>
                刪除
              </Button>
            ),
          },
        ]}
      />
      <div className="mb-3.5 flex items-center gap-3">
        <p className="body-lg text-basic-500">這段時間的整體心情....</p>
        <div className="p-2 bg-basic-100 rounded">
          {emojiOption?.emoji} {emojiOption?.label}
        </div>
      </div>
      <PostCard.Footer detailLink={detailLink} />
    </PostCard>
  );
}

export default ReviewCard;
