import dayjs from 'dayjs';

import Button from '@/shared/components/Button';
import Comment from '@/public/assets/icons/comment.svg';
import CommentInput from '@/shared/components/Comment/CommentInput';
import CommentCard from '@/shared/components/Comment/CommentCard';
import FeatureOverlay from '@/shared/components/FeatureOverlay';
import PostCard from '@/shared/components/Post/PostCard';
import { ProjectReviewSchema } from '@/services/project/reviews';
import numberToChineseNumber from '@/utils/numberToChineseNumber';

import RadioGroup from './RadioGroup';

interface ReviewDetailProps {
  data?: ProjectReviewSchema;
  onEditClick?: () => void;
  onDeleteClick?: () => void;
}

function ReviewDetail({ data, onEditClick, onDeleteClick }: ReviewDetailProps) {
  if (!data) return null;

  return (
    <PostCard>
      <PostCard.Header
        title={data.title}
        subtitle={`第${numberToChineseNumber(data.week)}週`}
        tag="覆盤"
        date={dayjs(data.created_at).format('YYYY/MM/DD')}
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
      <ul className="ml-8 list-decimal marker:heading-sm body-md font-normal">
        <li className="mb-8">
          <h3 className="mb-4 heading-sm">這段時間的整體心情：</h3>
          <div className="-ml-6 pb-8 border-b border-solid border-basic-100">
            <div className="mb-4">
              <RadioGroup type="emoji" name="mood" value={data.mood} />
            </div>
            <p className="mb-2">其他</p>
            <p>{data.mood_description}</p>
          </div>
        </li>
        <li className="mb-8">
          <h3 className="mb-4 heading-sm">壓力程度：</h3>
          <div className="-ml-6 pb-8 border-b border-solid border-basic-100">
            <RadioGroup
              type="tenPoint"
              name="pressure"
              value={data.stress_level}
            />
          </div>
        </li>
        <li className="mb-8">
          <h3 className="mb-4 heading-sm">學習回顧：</h3>
          <div className="-ml-6 pb-8 border-b border-solid border-basic-100">
            <p className="mb-4">學習動力</p>
            <div className="mb-4">
              <RadioGroup
                type="tenPoint"
                name="learning"
                value={data.learning_review}
              />
            </div>
            <p className="mb-4">這段時間，我的收穫與困難...</p>
            <p className="mb-4">{data.learning_feedback}</p>
          </div>
        </li>
        <li className="mb-5">
          <h3 className="mb-4 heading-sm">調整與規劃：</h3>
          <div className="-ml-6 pb-5 border-b border-solid border-basic-100">
            <p className="mb-4">為了更好的學習狀態，我會...</p>
            <p>{data.adjustment_plan}</p>
          </div>
        </li>
      </ul>
      <FeatureOverlay>
        <PostCard.Reward userName="用戶A" />
        <CommentInput className="px-4 py-6 border-b border-solid border-basic-200" />
        <div className="my-2 flex items-center gap-0.5 body-md text-basic-500">
          <Comment />
          <span>回覆 (1)</span>
        </div>
        <CommentCard
          avatar=""
          className="px-8 py-6 border border-solid border-basic-200 rounded-lg"
        >
          <CommentCard avatar="" />
        </CommentCard>
      </FeatureOverlay>
    </PostCard>
  );
}

export default ReviewDetail;
