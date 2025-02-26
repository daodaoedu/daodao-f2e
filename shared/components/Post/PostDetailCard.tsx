import dayjs from 'dayjs';
import CommentInput, {
  CommentData,
} from '@/shared/components/Comment/CommentInput';
import Comment from '@/public/assets/icons/comment.svg';
import PostCard from '@/shared/components/Post/PostCard';
import Button from '@/shared/components/Button';
import CommentCard from '@/shared/components/Comment/CommentCard';
import numberToChineseNumber from '@/utils/numberToChineseNumber';
import { CommentSchema } from '@/services/comments';
import { BaseUserSchema } from '@/services/users';
import { useAuth } from '@/contexts/Auth';

export interface BasePostDetailData {
  id: number;
  title: string;
  week: number;
  date: string;
}

interface BasePostDetailCardProps<T extends BasePostDetailData> {
  data?: T;
  comments?: CommentSchema[];
  authorUser?: BaseUserSchema;
  className?: string;
  tag: string;
  onEditClick?: () => void;
  onDeleteClick?: () => void;
  renderContent: (data: T) => React.ReactNode;
  onCreateComment?: (data: CommentData) => void;
  onUpdateComment?: (data: CommentData) => void;
  onDeleteComment?: (id: number) => void;
}

function PostDetailCard<T extends BasePostDetailData>({
  data,
  comments,
  authorUser,
  className,
  tag,
  onEditClick,
  onDeleteClick,
  renderContent,
  onCreateComment,
  onUpdateComment,
  onDeleteComment,
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
        subtitle={`第${numberToChineseNumber(data.week)}週`}
        tag={tag}
        date={dayjs(data.date).format('YYYY/MM/DD')}
        dropdownItems={dropdownItems}
      />
      {renderContent(data)}
      <hr className="mb-4 h-px bg-basic-100" />

      <PostCard.Reward userName={authorUser?.name} />
      {user && onCreateComment && (
        <CommentInput
          className="px-4 pb-4 pt-6"
          loginUser={user}
          onSubmit={onCreateComment}
        />
      )}
      {Array.isArray(comments) && comments.length > 0 && (
        <>
          <div className="pt-2 mb-2 flex items-center gap-0.5 body-md text-basic-500 border-t border-solid border-basic-200">
            <Comment />
            <span>回覆 ({comments.length})</span>
          </div>
          {Array.isArray(comments) && comments.length > 0 && (
            <div className="px-8 py-6 flex flex-col gap-4 border border-solid border-basic-200 rounded-lg">
              {comments.map((comment) => (
                <CommentCard
                  key={comment.id}
                  onCreate={onCreateComment}
                  onUpdate={onUpdateComment}
                  onDelete={onDeleteComment}
                  {...comment}
                />
              ))}
            </div>
          )}
        </>
      )}
    </PostCard>
  );
}

export default PostDetailCard;
