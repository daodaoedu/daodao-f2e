import Image from '@/shared/components/Image';
import PostDetailCard from '@/shared/components/Post/PostDetailCard';
import { ProjectNoteSchema } from '@/services/project/notes';
import { BaseUserSchema } from '@/services/users';
import { CommentType } from '@/services/comments';

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
          <p className="mb-3 whitespace-pre-wrap">{noteData.content}</p>
          {noteData.imgUrls && noteData.imgUrls.length > 0 && (
            <Image
              src={noteData.imgUrls[0]}
              alt={noteData.title}
              height="300px"
              className="object-contain"
            />
          )}
        </div>
      )}
    />
  );
}

export default NoteDetail;
