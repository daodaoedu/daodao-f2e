import Comment from "@/public/assets/icons/comment.svg";
import { type CommentType, useComments } from "@/services/comments";
import CommentCard from "./CommentCard";
import CommentInput from "./CommentInput";

export interface CommentSectionProps {
  targetId: string | number;
  targetType: CommentType;
  hideVisibilityToggle?: boolean;
  hideCommentCount?: boolean;
}

function CommentSection({
  targetId,
  targetType,
  hideVisibilityToggle = false,
  hideCommentCount = false,
}: CommentSectionProps) {
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
        hideVisibilityToggle={hideVisibilityToggle}
      />
      {Array.isArray(comments) && comments.length > 0 && (
        <>
          {!hideCommentCount && (
            <div className="body-md mb-2 flex items-center gap-0.5 border-t border-solid border-basic-200 pt-2 text-basic-500">
              <Comment />
              <span>回覆 ({comments.length})</span>
            </div>
          )}
          {Array.isArray(comments) && comments.length > 0 && (
            <div className="flex flex-col gap-4 rounded-lg border border-solid border-basic-200 px-8 py-6">
              {comments.map((comment) => (
                <CommentCard
                  key={comment.id}
                  onCreate={createMutation.trigger}
                  onUpdate={updateMutation.trigger}
                  onDelete={deleteMutation.trigger}
                  hideVisibilityToggle={hideVisibilityToggle}
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
