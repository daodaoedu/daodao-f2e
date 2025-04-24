import PostDetailCard, {
  BasePostDetailData,
} from '@/shared/components/Post/PostDetailCard';
import { ProjectReviewSchema } from '@/services/modules/projects';
import { BaseUserSchema } from '@/services/modules/users';
import { CommentType } from '@/services/modules/comments';
import MarkdownEditor from '@/shared/components/MarkdownEditor';
import RadioGroup from './RadioGroup';

interface ReviewDetailProps {
  data?: ProjectReviewSchema;
  authorUser?: BaseUserSchema;
  onEditClick?: () => void;
  onDeleteClick?: () => void;
}

function ReviewDetail({
  data,
  authorUser,
  onEditClick,
  onDeleteClick,
}: ReviewDetailProps) {
  if (!data) return null;

  const postData: BasePostDetailData = {
    id: data.id,
    title: data.title,
    week: data.week,
    date: data.createdAt,
  };

  return (
    <PostDetailCard
      data={postData}
      targetType={CommentType.Review}
      tag="覆盤"
      authorUser={authorUser}
      onEditClick={onEditClick}
      onDeleteClick={onDeleteClick}
      renderContent={() => (
        <ul className="ml-8 list-decimal marker:heading-sm body-md font-normal">
          <li className="mb-8">
            <h3 className="mb-4 heading-sm">這段時間的整體心情：</h3>
            <div className="-ml-6 pb-8 border-b border-solid border-basic-100">
              <div className="mb-4">
                <RadioGroup type="emoji" name="mood" value={data.mood} />
              </div>
              <p className="mb-2">其他</p>
              <p>{data.moodDescription}</p>
            </div>
          </li>
          <li className="mb-8">
            <h3 className="mb-4 heading-sm">壓力程度：</h3>
            <div className="-ml-6 pb-8 border-b border-solid border-basic-100">
              <RadioGroup
                type="tenPoint"
                name="pressure"
                value={data.stressLevel}
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
                  value={data.learningReview}
                />
              </div>
              <p className="mb-4">這段時間，我的收穫與困難...</p>
              <MarkdownEditor className="mb-4" readOnly value={data.learningFeedback} />
            </div>
          </li>
          <li className="mb-5">
            <h3 className="mb-4 heading-sm">調整與規劃：</h3>
            <div className="-ml-6 pb-5 border-b border-solid border-basic-100">
              <p className="mb-4">為了更好的學習狀態，我會...</p>
              <MarkdownEditor readOnly value={data.adjustmentPlan} />
            </div>
          </li>
        </ul>
      )}
    />
  );
}

export default ReviewDetail;
