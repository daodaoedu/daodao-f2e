import Image from '@/shared/components/Image';
import PostPreviewCard from '@/shared/components/Post/PostPreviewCard';
import { IdeaSchema } from '@/services/ideas';

interface IdeaCardProps {
  data: IdeaSchema;
  className?: string;
  detailLink?: string;
  onEditClick?: () => void;
  onDeleteClick?: () => void;
}

function IdeaCard({
  data,
  className,
  detailLink,
  onEditClick,
  onDeleteClick,
}: IdeaCardProps) {

  const renderContent = (ideaData: IdeaSchema) => (
    <div className="mb-3 body-sm text-basic-500">
      <p className="mb-3 whitespace-pre-wrap min-h-12 max-h-48 overflow-hidden">
        {ideaData.content}
      </p>
      {ideaData.imageUrls && ideaData.imageUrls.length > 0 && (
        <Image
          src={ideaData.imageUrls[0]}
          alt={ideaData.title}
          className="w-full h-auto object-contain"
          />
      )}
            {ideaData.ideaResources && ideaData.ideaResources.length > 0 && (
        <div className="mt-3">
          <h4 className="font-bold mb-2">學習資源</h4>
          <ul className="list-disc pl-5">
            {ideaData.ideaResources.map((resource, index) => (
              <li key={index} className="mb-1">
                <a
                  href={resource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-500 hover:underline"
                >
                  {resource.name}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );

  return (
    <PostPreviewCard
      data={data}
      tag="想法"
      className={className}
      detailLink={detailLink}
      onEditClick={onEditClick}
      onDeleteClick={onDeleteClick}
      renderContent={renderContent}
    />
  );
}

export default IdeaCard;