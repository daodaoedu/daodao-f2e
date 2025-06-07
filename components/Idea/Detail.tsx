import Link from 'next/link';
import Image from '@/shared/components/Image';
import PostDetailCard from '@/shared/components/Post/PostDetailCard';
import { IdeaSchema } from '@/services/ideas';
import { BaseUserSchema } from '@/services/users';
import { MdLink } from "react-icons/md";
import { CommentType } from '@/services/comments';

interface IdeaDetailProps {
    data?: IdeaSchema;
    authorUser?: BaseUserSchema;
    className?: string;
    onEditClick?: () => void;
    onDeleteClick?: () => void;
}

function extractNumberFromId(id: string): number {
    // 使用 split 分割字符串，以 '-' 作為分隔符
    const parts = id.split('_');
    // 獲取最後一部分並轉換為數字
    const numberPart = parseInt(parts[parts.length - 1], 10);
    return numberPart;
}

function IdeaDetail({
    data,
    authorUser,
    className,
    onEditClick,
    onDeleteClick,
}: IdeaDetailProps) {
    return (
      <PostDetailCard
        data={{
                ...(data || {}),
                id: extractNumberFromId(data?.id || '') || 0,
                title: data?.title || '',
                content: data?.content || '',
                imageUrls: data?.imageUrls || [], // 這裡改用 imageURLs
                videoUrls: data?.videoUrls || [], // 這裡改用 videoURLs
                ideaResources: data?.ideaResources || [], // 同理
            }}
        targetType={CommentType.Idea}
        className={className}
        tag="Idea"
        authorUser={authorUser}
        onEditClick={onEditClick}
        onDeleteClick={onDeleteClick}
        renderContent={(ideaData) => (
          <div className="mb-4 body-sm text-basic-500">
            <p className="mb-3 whitespace-pre-wrap">{ideaData.content}</p>
            {ideaData.ideaResources && ideaData.ideaResources.length > 0 && (
            <Image
              src={ideaData.imageUrls[0]}
              alt={ideaData.title}
              height="300px"
              className="object-contain"
            />
                    )}
            {ideaData.ideaResources && ideaData.ideaResources.length > 0 && (
            <div className="mt-4">
              <h4 className="mb-2 text-basic-500 font-sans font-medium text-[16px] leading-[150%]">
                學習資源
              </h4>
              {ideaData.ideaResources.map((resource) => (
                <div key={resource.id} className="rounded-lg p-2 m-2 border border-solid border-[#DBDBDB]">
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
            )}
      />
    );
}

export default IdeaDetail;
