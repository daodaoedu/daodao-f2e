import Image from '@/shared/components/Image';
import PostDetailCard from '@/shared/components/Post/PostDetailCard';
import { ProjectNoteSchema } from '@/services/project/notes';
import { CommentSchema } from '@/services/comments';
import { BaseUserSchema } from '@/services/users';
import { CommentData } from '@/shared/components/Comment/CommentInput';

interface NoteDetailProps {
  data?: ProjectNoteSchema;
  authorUser?: BaseUserSchema;
  comments?: CommentSchema[];
  className?: string;
  onEditClick?: () => void;
  onDeleteClick?: () => void;
  onCreateComment?: (comment: CommentData) => void;
  onUpdateComment?: (comment: CommentData) => void;
  onDeleteComment?: (id: number) => void;
}

function NoteDetail({
  data,
  authorUser,
  comments,
  className,
  onEditClick,
  onDeleteClick,
  onCreateComment,
  onUpdateComment,
  onDeleteComment,
}: NoteDetailProps) {
  return (
    <PostDetailCard
      data={data}
      comments={comments}
      className={className}
      tag="便利貼"
      authorUser={authorUser}
      onEditClick={onEditClick}
      onDeleteClick={onDeleteClick}
      onCreateComment={onCreateComment}
      onUpdateComment={onUpdateComment}
      onDeleteComment={onDeleteComment}
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
