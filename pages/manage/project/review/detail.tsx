import { toast } from 'react-hot-toast';
import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import getProjectLayout from '@/layout/ProjectLayout';
import ReviewDetail from '@/components/Review/Detail';
import UpdateModal from '@/components/Review/Modals/UpdateModal';
import {
  useProject,
  useProjectReview,
  useProjectReviewMutation,
} from '@/services/modules/projects';
import ConfirmModal from '@/shared/components/Confirm';
import { parseParamsToNumber } from '@/services/core';

enum ModalTypeEnum {
  Update,
  Delete,
}

const ReviewPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const projectId = searchParams.get('id');
  const reviewId = parseParamsToNumber(searchParams.get('reviewId'));
  const [modalType, setModalType] = useState<ModalTypeEnum | null>(null);
  const { data: project } = useProject(projectId);

  const { data: review } = useProjectReview({
    projectId,
    reviewId,
  });

  const { updateMutation, deleteMutation } = useProjectReviewMutation({
    projectId: projectId ?? undefined,
    reviewId,
    onUpdated: () => {
      toast.success('更新成功');
      setModalType(null);
    },
    onDeleted: () => {
      toast.success('刪除成功');
      router.replace(`/manage/project/review?id=${projectId}`);
    },
  });

  if (!projectId || reviewId == null) {
    return null;
  }

  return (
    <>
      <ReviewDetail
        data={review}
        authorUser={project?.user}
        onEditClick={() => setModalType(ModalTypeEnum.Update)}
        onDeleteClick={() => setModalType(ModalTypeEnum.Delete)}
      />

      {review && project && (
        <UpdateModal
          projectId={projectId}
          projectTitle={project.title}
          reviewId={reviewId}
          defaultValues={review}
          week={review.week}
          createdAt={review.createdAt}
          isOpen={modalType === ModalTypeEnum.Update}
          onClose={() => setModalType(null)}
          onSubmit={updateMutation.trigger}
          isLoading={updateMutation.isMutating}
        />
      )}

      {review && (
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

ReviewPage.getLayout = (page: React.ReactElement) =>
  getProjectLayout(page, 'review');

export default ReviewPage;
