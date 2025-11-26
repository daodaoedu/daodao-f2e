import { Image } from '@/shared/ui/image';
import { PostDetailCard } from '@/entities/post';
import { ProjectOutcomeSchema } from '@/services/projects';
import { BaseUserSchema } from '@/services/users';
import { MarkdownEditor } from '@/shared/ui/markdown-editor';
import { useAuth } from '@/entities/user';

interface OutcomeDetailProps {
  data?: ProjectOutcomeSchema;
  authorUser?: BaseUserSchema;
  className?: string;
  commentSection?: React.ReactNode;
  onEditClick?: () => void;
  onDeleteClick?: () => void;
}

function OutcomeDetail({
  data,
  authorUser,
  className,
  commentSection,
  onEditClick,
  onDeleteClick,
}: OutcomeDetailProps) {
  const { user } = useAuth();
  const isOwner = user?.id === authorUser?.id;

  return (
    <PostDetailCard
      data={data}
      commentSection={commentSection}
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
