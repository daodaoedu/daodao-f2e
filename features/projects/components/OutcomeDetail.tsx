import Image from '@/shared/components/Image';
import PostDetailCard from '@/shared/components/Post/PostDetailCard';
import { ProjectOutcomeSchema } from '@/services/projects';
import { BaseUserSchema } from '@/services/users';
import { CommentType } from '@/services/comments';
import { MarkdownEditor } from '@/components/ui/markdown-editor';

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
        <div className="body-sm mb-4 text-basic-500">
          <MarkdownEditor className="mb-3" readOnly value={outcomeData.content} />
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
