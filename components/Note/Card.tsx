import Image from '@/shared/components/Image';
import { ProjectNoteSchema } from '@/services/project/notes';
import PostPreviewCard from '@/shared/components/Post/PostPreviewCard';

interface NoteCardProps {
  data: ProjectNoteSchema;
  className?: string;
  detailLink?: string;
  onEditClick?: () => void;
  onDeleteClick?: () => void;
}

function NoteCard({
  data,
  className,
  detailLink,
  onEditClick,
  onDeleteClick,
}: NoteCardProps) {
  const renderContent = (noteData: ProjectNoteSchema) => (
    <div className="mb-3 body-sm text-basic-500">
      <p className="mb-3 whitespace-pre-wrap min-h-12 max-h-48 overflow-hidden">
        {noteData.content}
      </p>
      {noteData.imgUrls && noteData.imgUrls.length > 0 && (
        <Image src={noteData.imgUrls[0]} alt={noteData.title} height="300px" />
      )}
    </div>
  );

  return (
    <PostPreviewCard
      data={data}
      tag="便利貼"
      className={className}
      detailLink={detailLink}
      onEditClick={onEditClick}
      onDeleteClick={onDeleteClick}
      renderContent={renderContent}
    />
  );
}

export default NoteCard;
