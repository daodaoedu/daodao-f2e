import { Image } from '@/shared/ui/image';
import { PostDetailCard } from '@/entities/post';
import { ProjectNoteSchema } from '@/services/projects';
import { BaseUserSchema } from '@/services/users';
import { MarkdownEditor } from '@/shared/ui/markdown-editor';
import { useAuth } from '@/entities/user';

interface NoteDetailProps {
  data?: ProjectNoteSchema;
  authorUser?: BaseUserSchema;
  className?: string;
  commentSection?: React.ReactNode;
  onEditClick?: () => void;
  onDeleteClick?: () => void;
}

function NoteDetail({
  data,
  authorUser,
  className,
  commentSection,
  onEditClick,
  onDeleteClick,
}: NoteDetailProps) {
  const { user } = useAuth();
  const isOwner = user?.id === authorUser?.id;

  return (
    <PostDetailCard
      data={data}
      commentSection={commentSection}
      authorUser={authorUser}
      className={className}
      tag="便利貼"
      isOwner={isOwner}
      onEditClick={onEditClick}
      onDeleteClick={onDeleteClick}
      renderContent={(noteData) => (
        <div className="body-sm mb-4 text-basic-500">
          <MarkdownEditor className="mb-3" readOnly value={noteData.content} />
          {Array.isArray(noteData.imgUrls) &&
            noteData.imgUrls.map((imgUrl) => (
              <Image
                key={imgUrl}
                src={imgUrl}
                alt={noteData.title}
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

export default NoteDetail;
