import toast from 'react-hot-toast';
import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import getProjectLayout from '@/layout/ProjectLayout';
import Button from '@/shared/components/Button';
import ReviewCard from '@/components/Review/Card';
import CreateModal from '@/components/Review/Modals/CreateModal';
import UpdateModal from '@/components/Review/Modals/UpdateModal';
import { useProject } from '@/services/modules/projects';
import {
  useProjectReview,
  useProjectReviewList,
} from '@/hooks/api/project';
import ConfirmModal from '@/shared/components/Confirm';
import marathonConfig from '@/constants/marathon';

enum ModalTypeEnum {
  Create,
  Update,
  Delete,
}

const ReviewPage = () => {
  const searchParams = useSearchParams();
  const projectId = searchParams.get('id');
  const [modalType, setModalType] = useState<ModalTypeEnum | null>(null);
  const [reviewId, setReviewId] = useState<number | undefined>(undefined);
  const { data: project } = useProject(projectId);

  const { data: detail, mutate } = useProjectReview({
    projectId: projectId ?? undefined,
    reviewId,
  });

  const {
    data: reviews,
    createMutation,
    updateMutation,
    deleteMutation,
  } = useProjectReviewList(projectId ?? undefined, {
    onCreated: () => {
      toast.success('新增成功');
      setModalType(null);
    },
    onUpdated: () => {
      toast.success('更新成功');
      setModalType(null);
      setReviewId(undefined);
      mutate();
    },
    onDeleted: () => {
      toast.success('刪除成功');
      setModalType(null);
      setReviewId(undefined);
    },
  });

  if (!projectId) {
    return <div>專案不存在</div>;
  }

  return (
    <>
      <div className="mb-6 flex items-end sm:items-center justify-between body-md">
        <div className="flex flex-col items-start sm:flex-row sm:items-center gap-1">
          <div className="text-basic-500">
            覆盤（{marathonConfig.getWeekNumber().toString().padStart(2, '0')} 週/22週）
          </div>
        </div>
        <Button
          variant="solid"
          color="primary"
          onClick={() => setModalType(ModalTypeEnum.Create)}
        >
          新增覆盤
        </Button>
      </div>

      <ul className="flex flex-col gap-6">
        {Array.isArray(reviews) &&
          reviews.map((review) => (
            <li key={review.id}>
              <ReviewCard
                data={review}
                detailLink={`/manage/project/review/detail?id=${projectId}&reviewId=${review.id}`}
                onEditClick={() => {
                  setReviewId(review.id);
                  setModalType(ModalTypeEnum.Update);
                }}
                onDeleteClick={() => {
                  setReviewId(review.id);
                  setModalType(ModalTypeEnum.Delete);
                }}
              />
            </li>
          ))}
      </ul>

      {project && (
        <CreateModal
          projectId={projectId}
          projectTitle={project.title}
          isOpen={modalType === ModalTypeEnum.Create}
          onClose={() => setModalType(null)}
          onSubmit={createMutation.trigger}
          isLoading={createMutation.isMutating}
        />
      )}

      {detail && reviewId && project && (
        <UpdateModal
          projectId={projectId}
          projectTitle={project.title}
          reviewId={reviewId}
          defaultValues={detail}
          week={detail.week}
          createdAt={detail.createdAt}
          isOpen={modalType === ModalTypeEnum.Update}
          onClose={() => setModalType(null)}
          onSubmit={updateMutation.trigger}
          isLoading={updateMutation.isMutating}
        />
      )}

      {reviewId && (
        <ConfirmModal
          title="確認刪除覆盤"
          confirmText="確認刪除"
          confirmColor="alert"
          isOpen={modalType === ModalTypeEnum.Delete}
          onClose={() => setModalType(null)}
          onConfirm={() => deleteMutation.trigger({ projectId, reviewId })}
          isLoading={deleteMutation.isMutating}
        />
      )}
    </>
  );
};

ReviewPage.getLayout = getProjectLayout;

export default ReviewPage;
