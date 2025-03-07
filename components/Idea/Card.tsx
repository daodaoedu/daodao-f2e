import Link from 'next/link';
import Image from '@/shared/components/Image';
import PostPreviewCard from '@/shared/components/Post/PostPreviewCard';
import { IdeaSchema } from '@/services/ideas';
import { MdLink } from "react-icons/md";

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
  console.log('IdeaCard', data);

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
          <h4 className="mb-2 text-basic-500 font-sans font-medium text-[16px] leading-[150%]">
            學習資源
          </h4>
          {ideaData.ideaResources.map((resource) => (
            <div key={resource.id} className="rounded-lg p-2 mt-2 mb-2 border border-solid border-[#DBDBDB]">
              <Link
                href={resource.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-basic-500 hover:underdivne  p-2 flex justify-between items-center gap-1"
              >
                {resource.name}
                <MdLink size={18} color="#92989A" />

              </Link>
            </div>
          ))}
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
