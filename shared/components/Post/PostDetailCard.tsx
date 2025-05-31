import dayjs from 'dayjs';
import PostCard from '@/shared/components/Post/PostCard';
import { Button } from '@/components/atoms/button';
import numberToChineseNumber from '@/utils/numberToChineseNumber';
import { BaseUserSchema } from '@/services/modules/users';
import { useAuth } from '@/contexts/Auth';
import CommentSection from '@/shared/components/Comment/CommentSection';
import { CommentType } from '@/services/modules/comments';

export interface BasePostDetailData {
  id: number;
  title: string;
  week?: number;
  date?: string;
}

interface BasePostDetailCardProps<T extends BasePostDetailData> {
  data?: T;
  /** 留言類型，不傳則不顯示留言功能 */
  targetType?: CommentType;
  /** 作者資訊，不傳則不顯示編輯、刪除功能 */
  authorUser?: BaseUserSchema;
  className?: string;
  tag: string;
  onEditClick?: () => void;
  onDeleteClick?: () => void;
  renderContent: (data: T) => React.ReactNode;
}

function PostDetailCard<T extends BasePostDetailData>({
  data,
  targetType,
  authorUser,
  className,
  tag,
  onEditClick,
  onDeleteClick,
  renderContent,
}: BasePostDetailCardProps<T>) {
  const { user } = useAuth();
  const isSelf = user?._id === authorUser?._id;

  const dropdownItems = isSelf
    ? [
        {
          key: 'edit',
          children: (
            <Button
              size="sm"
              variant="ghost"
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
              variant="ghost"
              className="hover:bg-primary-lightest"
              onClick={onDeleteClick}
            >
              刪除
            </Button>
          ),
        },
      ]
    : [
        {
          key: 'report',
          children: '檢舉',
          onClick: () =>
            window.open(
              'https://forms.gle/NkVbDWC3eXk4P4gv7',
              '_blank',
              'noopener'
            ),
        },
      ];

  if (!data) return null;

  return (
    <PostCard className={className}>
      <PostCard.Header
        title={data.title}
        subtitle={data.week !== undefined ? `第${numberToChineseNumber(data.week)}週` : ''}
        tag={tag}
        date={dayjs(data.date).format('YYYY/MM/DD')}
        dropdownItems={dropdownItems}
      />
      {renderContent(data)}
      <hr className="mb-4 h-px bg-basic-100" />
      <PostCard.Reward userName={authorUser?.name} />
      {targetType && (
        <CommentSection targetId={data.id} targetType={targetType} />
      )}
    </PostCard>
  );
}

export default PostDetailCard;
