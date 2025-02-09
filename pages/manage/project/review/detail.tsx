import { toast } from 'react-hot-toast';
import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import getProjectLayout from '@/layout/ProjectLayout';
import ReviewDetail from '@/components/Review/Detail';
import { useProjectReviewMutation } from '@/hooks/api/review';
import UpdateModal from '@/components/Review/Modals/UpdateModal';
import { useProjectQuery } from '@/hooks/api/project';
import ConfirmModal from '@/shared/components/Confirm';

enum ModalTypeEnum {
  Update = 'update',
  Delete = 'delete',
}

const ReviewPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const projectId = searchParams.get('id') ?? undefined;
  const reviewId = parseInt(searchParams.get('reviewId') ?? '0', 10);
  const [modalType, setModalType] = useState<ModalTypeEnum | null>(null);
  const { data: project } = useProjectQuery({ projectId });
  const {
    data: review,
    update,
    remove,
  } = useProjectReviewMutation({
    projectId,
    reviewId,
    onUpdated: () => {
      toast.success('覆盤更新成功');
      setModalType(null);
    },
    onDeleted: () => {
      toast.success('覆盤刪除成功');
      router.replace(`/manage/project/review?id=${projectId}`);
    },
  });

  if (!projectId || !reviewId) {
    router.replace(`/manage/project/review?id=${projectId}`);
    return null;
  }

  return (
    <>
      <ReviewDetail
        data={review}
        onEditClick={() => setModalType(ModalTypeEnum.Update)}
        onDeleteClick={() => setModalType(ModalTypeEnum.Delete)}
      />

      {review && reviewId && (
        <UpdateModal
          projectId={projectId}
          projectTitle={project?.title}
          reviewId={reviewId}
          defaultValues={review}
          week={review.week}
          createdAt={review.created_at}
          isOpen={modalType === ModalTypeEnum.Update}
          onClose={() => setModalType(null)}
          onSubmit={update.trigger}
          isLoading={update.isMutating}
        />
      )}

      {review && reviewId && (
        <ConfirmModal
          title="確認刪除覆盤"
          confirmText="確認刪除"
          confirmColor="alert"
          isOpen={modalType === ModalTypeEnum.Delete}
          onClose={() => setModalType(null)}
          onConfirm={() => remove.trigger({ projectId, reviewId })}
          isLoading={remove.isMutating}
        />
      )}
    </>
  );
};

ReviewPage.getLayout = (page: React.ReactElement) =>
  getProjectLayout(page, 'review');

export default ReviewPage;
