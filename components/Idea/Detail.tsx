import Image from '@/shared/components/Image';
import PostDetailCard from '@/shared/components/Post/PostDetailCard';
import { IdeaSchema } from '@/services/ideas';
import { BaseUserSchema } from '@/services/users';
import { CommentType } from '@/services/comments';

interface IdeaResource {
    url: string;
    name: string;
    // Add other properties of the resource as needed
}

interface IdeaDetailProps {
    data?: IdeaSchema;
    authorUser?: BaseUserSchema;
    className?: string;
    onEditClick?: () => void;
    onDeleteClick?: () => void;
}

function hashUUIDToNumber(uuid: string): number {
    if (!uuid) return 0; // 或根據需求返回其他預設值
    let hash = 0;
    for (let i = 0; i < uuid.length; i++) {
        const char = uuid.charCodeAt(i);
        hash = (hash << 5) - hash + char;
        hash |= 0; // 轉換為 32 位元整數
    }
    return Math.abs(hash);
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
                id: data?.id ? hashUUIDToNumber(data.id) : 0,
                title: data?.title || '',
                content: data?.content || '',
                imageUrls: data?.imageUrls || [],  // 這裡改用 imageURLs
                videoUrls: data?.videoUrls || [],  // 這裡改用 videoURLs
                ideaResources: data?.ideaResources || [],  // 同理
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
                            <h3 className="font-bold mb-2">學習資源</h3>
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
            )}
        />
    );
}

export default IdeaDetail;