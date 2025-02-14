import dayjs from 'dayjs';
import CommentInput from '@/shared/components/Comment/CommentInput';
import Comment from '@/public/assets/icons/comment.svg';
import Image from '@/shared/components/Image';
import PostCard from '@/shared/components/Post/PostCard';
import Button from '@/shared/components/Button';
import CommentCard from '@/shared/components/Comment/CommentCard';
import FeatureOverlay from '@/shared/components/FeatureOverlay';
import { ProjectOutcomeSchema } from '@/services/project/outcomes';
import numberToChineseNumber from '@/utils/numberToChineseNumber';

interface OutcomeDetailProps {
  data?: ProjectOutcomeSchema;
  className?: string;
  onEditClick?: () => void;
  onDeleteClick?: () => void;
}

function OutcomeDetail({
  data,
  className,
  onEditClick,
  onDeleteClick,
}: OutcomeDetailProps) {
  if (!data) return null;

  return (
    <PostCard className={className}>
      <PostCard.Header
        title={data.title}
        subtitle={`第${numberToChineseNumber(data.week)}週`}
        tag="成果"
        date={dayjs(data.date).format('YYYY/MM/DD')}
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
      <div className="mb-4 body-sm text-basic-500">
        <p className="mb-3 whitespace-pre-wrap">{data.description}</p>
        {data.img_url && (
          <Image src={data.img_url} alt={data.title} height="300px" />
        )}
      </div>
      <hr className="mb-4 h-px bg-basic-100" />

      <FeatureOverlay>
        <PostCard.Reward userName="用戶A" />
        <CommentInput className="px-4 py-6 border-b border-solid border-basic-200" />
        <div className="my-2 flex items-center gap-0.5 body-md text-basic-500">
          <Comment />
          <span>回覆 (1)</span>
        </div>
        <CommentCard
          avatar=""
          className="px-8 py-6 border border-solid border-basic-200 rounded-lg"
        >
          <CommentCard avatar="" />
        </CommentCard>
      </FeatureOverlay>
    </PostCard>
  );
}

export default OutcomeDetail;
