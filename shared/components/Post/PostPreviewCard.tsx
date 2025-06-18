import dayjs from 'dayjs';
import { Button } from '@/components/ui/button';
import PostCard from '@/shared/components/Post/PostCard';
import numberToChineseNumber from '@/utils/numberToChineseNumber';

export interface BasePostData {
  title: string;
  week?: number;
  date?: string;
}

export interface PostPreviewCardProps<T extends BasePostData> {
  data: T;
  tag: string;
  className?: string;
  detailLink?: string;
  onEditClick?: () => void;
  onDeleteClick?: () => void;
  renderContent: (data: T) => React.ReactNode;
}

function PostPreviewCard<T extends BasePostData>({
  data,
  tag,
  className,
  detailLink,
  onEditClick,
  onDeleteClick,
  renderContent,
}: PostPreviewCardProps<T>) {
  const dropdownItems = [
    {
      key: 'edit',
      children: (
        <Button
          size="sm"
          variant="ghost"
          className="hover:bg-primary-lightest"
          onClick={onEditClick}
        >
          編輯
        </Button>
      ),
    },
    {
      key: 'delete',
      children: (
        <Button
          size="sm"
          variant="ghost"
          className="hover:bg-primary-lightest"
          onClick={onDeleteClick}
        >
          刪除
        </Button>
      ),
    },
  ];

  return (
    <PostCard className={className}>
      <PostCard.Header
        title={data.title}
        subtitle={data.week !== undefined ? `第${numberToChineseNumber(data.week)}週` : ''}
        tag={tag}
        date={dayjs(data.date).format('YYYY/MM/DD')}
        dropdownItems={dropdownItems}
      />
      {renderContent(data)}
      <PostCard.Footer detailLink={detailLink} />
    </PostCard>
  );
}

export default PostPreviewCard;
