import Image from '@/shared/components/Image';
import { ProjectNoteSchema } from '@/services/modules/projects';
import PostPreviewCard from '@/shared/components/Post/PostPreviewCard';
import MarkdownEditor from '@/shared/components/MarkdownEditor';

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
      <MarkdownEditor
        className="mb-3 min-h-12 max-h-48 overflow-hidden"
        readOnly
        value={noteData.content}
      />
      {noteData.imgUrls && noteData.imgUrls.length > 0 && (
        <Image
          src={noteData.imgUrls[0]}
          alt={noteData.title}
          height="300px"
          className="object-contain"
        />
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
