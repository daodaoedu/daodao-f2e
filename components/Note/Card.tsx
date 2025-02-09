import dayjs from 'dayjs';
import Image from '@/shared/components/Image';
import Button from '@/shared/components/Button';
import PostCard from '@/shared/components/Post/PostCard';
import { ProjectNoteSchema } from '@/services/project/notes';
import numberToChineseNumber from '@/utils/numberToChineseNumber';

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
  return (
    <PostCard className={className}>
      <PostCard.Header
        title={data.title}
        subtitle={`第${numberToChineseNumber(data.week)}週`}
        tag="便利貼"
        date={dayjs(data.date).format('YYYY/MM/DD')}
        dropdownItems={[
          {
            key: 'edit',
            children: (
              <Button size="sm" onClick={onEditClick}>
                編輯
              </Button>
            ),
          },
          {
            key: 'delete',
            children: (
              <Button size="sm" onClick={onDeleteClick}>
                刪除
              </Button>
            ),
          },
        ]}
      />
      <div className="mb-3 body-sm text-basic-500">
        <p className="mb-3 whitespace-pre-wrap min-h-12 max-h-48 overflow-hidden">
          {data.description}
        </p>
        {data.img_url && (
          <Image src={data.img_url} alt={data.title} height="300px" />
        )}
      </div>
      <PostCard.Footer detailLink={detailLink} />
    </PostCard>
  );
}

export default NoteCard;
