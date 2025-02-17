import Image from '@/shared/components/Image';
import PostDetailCard from '@/shared/components/Post/PostDetailCard';
import { ProjectOutcomeSchema } from '@/services/project/outcomes';

interface OutcomeDetailProps {
  data?: ProjectOutcomeSchema;
  className?: string;
  onEditClick?: () => void;
  onDeleteClick?: () => void;
}

function OutcomeDetail({
  data,
  className,
  onEditClick,
  onDeleteClick,
}: OutcomeDetailProps) {
  return (
    <PostDetailCard
      data={data}
      className={className}
      tag="成果"
      onEditClick={onEditClick}
      onDeleteClick={onDeleteClick}
      renderContent={(outcomeData) => (
        <div className="mb-4 body-sm text-basic-500">
          <p className="mb-3 whitespace-pre-wrap">{outcomeData.description}</p>
          {outcomeData.imgUrl && (
            <Image src={outcomeData.imgUrl} alt={outcomeData.title} height="300px" />
          )}
        </div>
      )}
    />
  );
}

export default OutcomeDetail;
