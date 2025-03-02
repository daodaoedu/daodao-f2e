import Comment from '@/public/assets/icons/comment.svg';
import { useCommentList } from '@/hooks/api/comment';
import { CommentType } from '@/services/comments';
import CommentInput from './CommentInput';
import CommentCard from './CommentCard';

interface CommentSectionProps {
  targetId: number;
  targetType: CommentType;
}

function CommentSection({ targetId, targetType }: CommentSectionProps) {
  const {
    data: comments,
    create: createComment,
    update: updateComment,
    remove: removeComment,
  } = useCommentList({
    targetType,
    targetId,
  });

  return (
    <>
      <CommentInput
        className="px-4 pb-4 pt-6"
        onSubmit={createComment.trigger}
      />
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
                  onCreate={createComment.trigger}
                  onUpdate={updateComment.trigger}
                  onDelete={removeComment.trigger}
                  {...comment}
                />
              ))}
            </div>
          )}
        </>
      )}
    </>
  );
}

export default CommentSection;
