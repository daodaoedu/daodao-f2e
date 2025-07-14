import { useRef, useEffect, useState } from 'react';
import Image from '@/shared/components/Image';
import PostPreviewCard from '@/shared/components/Post/PostPreviewCard';
import { MarkdownEditor } from '@/components/ui/markdown-editor';

const tagMap = {
  outcome: '成果',
  note: '便利貼',
};

interface ContentCardData {
  title: string;
  week?: number;
  date?: string;
  content: string;
  imgUrls?: string[] | null;
}

interface ContentCardProps<T> {
  data: T;
  type: keyof typeof tagMap;
  className?: string;
  detailLink?: string;
  onEditClick?: () => void;
  onDeleteClick?: () => void;
}

function ContentCard<T extends ContentCardData>({
  data,
  type,
  className,
  detailLink,
  onEditClick,
  onDeleteClick,
}: ContentCardProps<T>) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [showGradient, setShowGradient] = useState(false);
  const previewContent =
    data.content.length <= 100
      ? data.content
      : `${data.content.slice(0, 100)}...`;

  useEffect(() => {
    const checkHeight = () => {
      if (contentRef.current) {
        setShowGradient(contentRef.current.scrollHeight > 192);
      }
    };

    checkHeight();
    window.addEventListener('resize', checkHeight);
    return () => window.removeEventListener('resize', checkHeight);
  }, [data.content]);

  return (
    <PostPreviewCard
      data={data}
      tag={tagMap[type]}
      className={className}
      detailLink={detailLink}
      onEditClick={onEditClick}
      onDeleteClick={onDeleteClick}
      renderContent={() => (
        <div className="mb-3 body-sm text-basic-500">
          <div
            ref={contentRef}
            className="relative mb-3 min-h-12 max-h-48 overflow-hidden"
          >
            <MarkdownEditor
              editorClassName="max-w-full"
              readOnly
              value={previewContent}
            />
            {showGradient && (
              <div className="absolute inset-0 bg-gradient-to-b from-transparent from-70% to-white pointer-events-none" />
            )}
          </div>
          {data.imgUrls && data.imgUrls.length > 0 && (
            <Image
              src={data.imgUrls[0]}
              alt={data.title}
              height="300px"
              className="object-contain"
            />
          )}
        </div>
      )}
    />
  );
}

export default ContentCard;
