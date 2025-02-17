import dayjs from 'dayjs';
import CommentInput from '@/shared/components/Comment/CommentInput';
import Comment from '@/public/assets/icons/comment.svg';
import PostCard from '@/shared/components/Post/PostCard';
import Button from '@/shared/components/Button';
import CommentCard from '@/shared/components/Comment/CommentCard';
import FeatureOverlay from '@/shared/components/FeatureOverlay';
import numberToChineseNumber from '@/utils/numberToChineseNumber';

export interface BasePostDetailData {
  id: number;
  title: string;
  week: number;
  date: string;
}

interface BasePostDetailCardProps<T extends BasePostDetailData> {
  data?: T;
  className?: string;
  tag: string;
  onEditClick?: () => void;
  onDeleteClick?: () => void;
  renderContent: (data: T) => React.ReactNode;
}

function PostDetailCard<T extends BasePostDetailData>({
  data,
  className,
  tag,
  onEditClick,
  onDeleteClick,
  renderContent,
}: BasePostDetailCardProps<T>) {
  const dropdownItems = [
    {
      key: 'edit',
      children: (
        <Button
          size="sm"
          className="hover:bg-primary-lightest"
          onClick={onEditClick}
        >
          編輯
        </Button>
      ),
    },
    {
      key: 'delete',
      children: (
        <Button
          size="sm"
          className="hover:bg-primary-lightest"
          onClick={onDeleteClick}
        >
          刪除
        </Button>
      ),
    },
  ];

  if (!data) return null;

  return (
    <PostCard className={className}>
      <PostCard.Header
        title={data.title}
        subtitle={`第${numberToChineseNumber(data.week)}週`}
        tag={tag}
        date={dayjs(data.date).format('YYYY/MM/DD')}
        dropdownItems={dropdownItems}
      />
      {renderContent(data)}
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

export default PostDetailCard;
