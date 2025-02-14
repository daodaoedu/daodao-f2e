import dayjs from 'dayjs';
import Image from '@/shared/components/Image';
import PostCard from '@/shared/components/Post/PostCard';
import { ProjectOutcomeSchema } from '@/services/project/outcomes';
import numberToChineseNumber from '@/utils/numberToChineseNumber';
import Button from '@/shared/components/Button';

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
  return (
    <PostCard className={className}>
      <PostCard.Header
        title={data.title}
        subtitle={`第${numberToChineseNumber(data.week)}週`}
        tag="成果"
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

export default OutcomeCard;
