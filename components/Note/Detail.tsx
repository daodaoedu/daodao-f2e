import Image from '@/shared/components/Image';
import PostDetailCard from '@/shared/components/Post/PostDetailCard';
import { ProjectNoteSchema } from '@/services/modules/projects';
import { BaseUserSchema } from '@/services/modules/users';
import { CommentType } from '@/services/modules/comments';
import MarkdownEditor from '@/shared/components/MarkdownEditor';

interface NoteDetailProps {
  data?: ProjectNoteSchema;
  authorUser?: BaseUserSchema;
  className?: string;
  onEditClick?: () => void;
  onDeleteClick?: () => void;
}

function NoteDetail({
  data,
  authorUser,
  className,
  onEditClick,
  onDeleteClick,
}: NoteDetailProps) {
  return (
    <PostDetailCard
      data={data}
      targetType={CommentType.Note}
      className={className}
      tag="便利貼"
      authorUser={authorUser}
      onEditClick={onEditClick}
      onDeleteClick={onDeleteClick}
      renderContent={(noteData) => (
        <div className="mb-4 body-sm text-basic-500">
          <MarkdownEditor className="mb-3" readOnly value={noteData.content} />
          {Array.isArray(noteData.imgUrls) &&
            noteData.imgUrls.map((imgUrl) => (
              <Image
                key={imgUrl}
                src={imgUrl}
                alt={noteData.title}
                height="300px"
                className="object-contain"
              />
            ))}
        </div>
      )}
    />
  );
}

export default NoteDetail;
