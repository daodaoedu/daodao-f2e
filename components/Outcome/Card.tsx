import Image from '@/shared/components/Image';
import { ProjectOutcomeSchema } from '@/services/project/outcomes';
import PostPreviewCard from '@/shared/components/Post/PostPreviewCard';

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
      <p className="mb-3 whitespace-pre-wrap min-h-12 max-h-48 overflow-hidden">
        {outcomeData.content}
      </p>
      {outcomeData.imgUrls && outcomeData.imgUrls.length > 0 && (
        <Image
          src={outcomeData.imgUrls[0]}
          alt={outcomeData.title}
          height="300px"
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
