import { Image } from '@/shared/ui/image';
import { PostDetailCard } from '@/entities/post';
import { ProjectOutcomeSchema } from '@/services/projects';
import { BaseUserSchema } from '@/services/users';
import { CommentType } from '@/services/comments';
import { MarkdownEditor } from '@/shared/ui/markdown-editor';
import { useSession } from '@/entities/session';

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
  const { user } = useSession();
  const isOwner = user?.id === authorUser?.id;

  return (
    <PostDetailCard
      data={data}
      targetType={CommentType.Outcome}
      authorUser={authorUser}
      className={className}
      tag="成果"
      isOwner={isOwner}
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
                width={400}
                height={300}
                className="object-contain"
              />
            ))}
        </div>
      )}
    />
  );
}

export default OutcomeDetail;
