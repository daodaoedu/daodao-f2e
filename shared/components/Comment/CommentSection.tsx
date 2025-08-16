import Comment from '@/public/assets/icons/comment.svg';
import { useComments, CommentType } from '@/services/comments';
import CommentInput from './CommentInput';
import CommentCard from './CommentCard';

interface CommentSectionProps {
  targetId: number | string;
  targetType: CommentType;
}

function CommentSection({ targetId, targetType }: CommentSectionProps) {
  const {
    data: comments,
    createMutation,
    updateMutation,
    deleteMutation,
  } = useComments({
    targetType,
    targetId,
  });

  return (
    <>
      <CommentInput
        className="px-4 pb-4 pt-6"
        onSubmit={createMutation.trigger}
      />
      {Array.isArray(comments) && comments.length > 0 && (
        <>
          <div className="body-md mb-2 flex items-center gap-0.5 border-t border-solid border-basic-200 pt-2 text-basic-500">
            <Comment />
            <span>
              回覆 (
              {comments.length}
              )
            </span>
          </div>
          {Array.isArray(comments) && comments.length > 0 && (
            <div className="flex flex-col gap-4 rounded-lg border border-solid border-basic-200 px-8 py-6">
              {comments.map((comment) => (
                <CommentCard
                  key={comment.id}
                  onCreate={createMutation.trigger}
                  onUpdate={updateMutation.trigger}
                  onDelete={deleteMutation.trigger}
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
