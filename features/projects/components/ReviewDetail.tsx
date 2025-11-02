import { PostDetailCard, BasePostDetailData } from '@/entities/post';
import { ProjectReviewSchema } from '@/services/projects';
import { BaseUserSchema } from '@/services/users';
import { CommentType } from '@/services/comments';
import { MarkdownEditor } from '@/shared/ui/markdown-editor';
import { useSession } from '@/entities/session';
import RadioGroup from './ReviewRadioGroup';

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
  const { user } = useSession();
  const isOwner = user?.id === authorUser?.id;

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
      isOwner={isOwner}
      onEditClick={onEditClick}
      onDeleteClick={onDeleteClick}
      renderContent={() => (
        <ul className="body-md ml-8 list-decimal font-normal marker:heading-sm">
          <li className="mb-8">
            <h3 className="heading-sm mb-4">這段時間的整體心情：</h3>
            <div className="-ml-6 border-b border-solid border-basic-100 pb-8">
              <div className="mb-4">
                <RadioGroup type="emoji" name="mood" value={data.mood} />
              </div>
              <p className="mb-2">其他</p>
              <p>{data.moodDescription}</p>
            </div>
          </li>
          <li className="mb-8">
            <h3 className="heading-sm mb-4">壓力程度：</h3>
            <div className="-ml-6 border-b border-solid border-basic-100 pb-8">
              <RadioGroup
                type="tenPoint"
                name="pressure"
                value={data.stressLevel}
              />
            </div>
          </li>
          <li className="mb-8">
            <h3 className="heading-sm mb-4">學習回顧：</h3>
            <div className="-ml-6 border-b border-solid border-basic-100 pb-8">
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
            <h3 className="heading-sm mb-4">調整與規劃：</h3>
            <div className="-ml-6 border-b border-solid border-basic-100 pb-5">
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
