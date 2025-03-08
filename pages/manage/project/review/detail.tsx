import { toast } from 'react-hot-toast';
import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import getProjectLayout from '@/layout/ProjectLayout';
import ReviewDetail from '@/components/Review/Detail';
import UpdateModal from '@/components/Review/Modals/UpdateModal';
import { useProject, useProjectReview } from '@/hooks/api/project';
import ConfirmModal from '@/shared/components/Confirm';

enum ModalTypeEnum {
  Update,
  Delete,
}

const ReviewPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const projectId = searchParams.get('id') ?? undefined;
  const reviewId = parseInt(searchParams.get('reviewId') ?? '0', 10);
  const [modalType, setModalType] = useState<ModalTypeEnum | null>(null);
  const { data: project } = useProject({ id: projectId });
  const {
    data: review,
    updateMutation: updateReview,
    deleteMutation: removeReview,
  } = useProjectReview({
    projectId,
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

  if (!projectId || !reviewId) {
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
          onSubmit={updateReview.trigger}
          isLoading={updateReview.isMutating}
        />
      )}

      {review && (
        <ConfirmModal
          title="確認刪除覆盤"
          confirmText="確認刪除"
          confirmColor="alert"
          isOpen={modalType === ModalTypeEnum.Delete}
          onClose={() => setModalType(null)}
          onConfirm={() => removeReview.trigger({ projectId, reviewId })}
          isLoading={removeReview.isMutating}
        />
      )}
    </>
  );
};

ReviewPage.getLayout = (page: React.ReactElement) =>
  getProjectLayout(page, 'review');

export default ReviewPage;
