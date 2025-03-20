import Image from '@/shared/components/Image';
import { ProjectOutcomeSchema } from '@/services/modules/projects';
import PostPreviewCard from '@/shared/components/Post/PostPreviewCard';
import MarkdownEditor from '@/shared/components/MarkdownEditor';

interface OutcomeCardProps {
  data: ProjectOutcomeSchema;
  className?: string;
  detailLink?: string;
  onEditClick?: () => void;
  onDeleteClick?: () => void;
}

function OutcomeCard({
  data,
  className,
  detailLink,
  onEditClick,
  onDeleteClick,
}: OutcomeCardProps) {
  const renderContent = (outcomeData: ProjectOutcomeSchema) => (
    <div className="mb-3 body-sm text-basic-500">
      <MarkdownEditor
        className="mb-3 min-h-12 max-h-48 overflow-hidden"
        readOnly
        value={outcomeData.content}
      />
      {outcomeData.imgUrls && outcomeData.imgUrls.length > 0 && (
        <Image
          src={outcomeData.imgUrls[0]}
          alt={outcomeData.title}
          height="300px"
          className="object-contain"
        />
      )}
    </div>
  );

  return (
    <PostPreviewCard
      data={data}
      tag="成果"
      className={className}
      detailLink={detailLink}
      onEditClick={onEditClick}
      onDeleteClick={onDeleteClick}
      renderContent={renderContent}
    />
  );
}

export default OutcomeCard;
