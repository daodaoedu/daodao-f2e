import Image from '@/shared/components/Image';
import PostDetailCard from '@/shared/components/Post/PostDetailCard';
import { ProjectOutcomeSchema } from '@/services/project/outcomes';
import { BaseUserSchema } from '@/services/users';
import { CommentSchema } from '@/services/comments';
import { CommentData } from '@/shared/components/Comment/CommentInput';

interface OutcomeDetailProps {
  data?: ProjectOutcomeSchema;
  authorUser?: BaseUserSchema;
  comments?: CommentSchema[];
  className?: string;
  onEditClick?: () => void;
  onDeleteClick?: () => void;
  onCreateComment?: (comment: Omit<CommentData, 'id'>) => void;
  onUpdateComment?: (comment: CommentData & { id: number }) => void;
  onDeleteComment?: (id: number) => void;
}

function OutcomeDetail({
  data,
  authorUser,
  comments,
  className,
  onEditClick,
  onDeleteClick,
  onCreateComment,
  onUpdateComment,
  onDeleteComment,
}: OutcomeDetailProps) {
  return (
    <PostDetailCard
      data={data}
      comments={comments}
      authorUser={authorUser}
      className={className}
      tag="成果"
      onEditClick={onEditClick}
      onDeleteClick={onDeleteClick}
      onCreateComment={onCreateComment}
      onUpdateComment={onUpdateComment}
      onDeleteComment={onDeleteComment}
      renderContent={(outcomeData) => (
        <div className="mb-4 body-sm text-basic-500">
          <p className="mb-3 whitespace-pre-wrap">{outcomeData.content}</p>
          {outcomeData.imgUrls && outcomeData.imgUrls.length > 0 && (
            <Image
              src={outcomeData.imgUrls[0]}
              alt={outcomeData.title}
              height="300px"
              className="object-contain"
            />
          )}
        </div>
      )}
    />
  );
}

export default OutcomeDetail;
