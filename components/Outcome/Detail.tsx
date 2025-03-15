import Image from '@/shared/components/Image';
import PostDetailCard from '@/shared/components/Post/PostDetailCard';
import { ProjectOutcomeSchema } from '@/services/projects/outcomes';
import { BaseUserSchema } from '@/services/users';
import { CommentType } from '@/services/comments';

interface OutcomeDetailProps {
  data?: ProjectOutcomeSchema;
  authorUser?: BaseUserSchema;
  className?: string;
  onEditClick?: () => void;
  onDeleteClick?: () => void;
}

function OutcomeDetail({
  data,
  authorUser,
  className,
  onEditClick,
  onDeleteClick,
}: OutcomeDetailProps) {
  return (
    <PostDetailCard
      data={data}
      targetType={CommentType.Outcome}
      authorUser={authorUser}
      className={className}
      tag="成果"
      onEditClick={onEditClick}
      onDeleteClick={onDeleteClick}
      renderContent={(outcomeData) => (
        <div className="mb-4 body-sm text-basic-500">
          <p className="mb-3 whitespace-pre-wrap">{outcomeData.content}</p>
          {Array.isArray(outcomeData.imgUrls) &&
            outcomeData.imgUrls.map((imgUrl) => (
              <Image
                key={imgUrl}
                src={imgUrl}
                alt={outcomeData.title}
                height="300px"
                className="object-contain"
              />
            ))}
        </div>
      )}
    />
  );
}

export default OutcomeDetail;
