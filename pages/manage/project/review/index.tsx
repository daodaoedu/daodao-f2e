import toast from 'react-hot-toast';
import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import getProjectLayout from '@/layout/ProjectLayout';
import Button from '@/shared/components/Button';
import ReviewCard from '@/components/Review/Card';
import CreateModal from '@/components/Review/Modals/CreateModal';
import UpdateModal from '@/components/Review/Modals/UpdateModal';
import {
  useProjectReviewMutation,
  useProjectReviewQuery,
} from '@/hooks/api/review';
import { useProjectMutation } from '@/hooks/api/project';
import ConfirmModal from '@/shared/components/Confirm';

enum ModalTypeEnum {
  Create = 'create',
  Update = 'update',
  Delete = 'delete',
}

const ReviewPage = () => {
  const searchParams = useSearchParams();
  const projectId = searchParams.get('id') ?? undefined;
  const [modalType, setModalType] = useState<ModalTypeEnum | null>(null);
  const [reviewId, setReviewId] = useState<number | undefined>(undefined);
  const { data: project } = useProjectMutation(projectId);

  const { data: detail, mutate } = useProjectReviewMutation({
    projectId,
    reviewId,
  });

  const {
    data: reviews,
    create,
    update,
    remove,
  } = useProjectReviewQuery(projectId, {
    onCreated: () => {
      toast.success('新增覆盤成功');
      setModalType(null);
    },
    onUpdated: () => {
      toast.success('覆盤更新成功');
      setModalType(null);
      setReviewId(undefined);
      mutate();
    },
    onDeleted: () => {
      toast.success('覆盤刪除成功');
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
          <div className="text-basic-500">覆盤（04 週/22週）</div>
          <Button
            className="px-2 -ml-2 sm:ml-0 text-primary-base"
            onClick={() => toast.error('功能尚未開放')}
          >
            覆盤設定
          </Button>
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
          week={1}
          isOpen={modalType === ModalTypeEnum.Create}
          onClose={() => setModalType(null)}
          onSubmit={create.trigger}
          isLoading={create.isMutating}
        />
      )}

      {detail && reviewId && project && (
        <UpdateModal
          projectId={projectId}
          projectTitle={project.title}
          reviewId={reviewId}
          defaultValues={detail}
          week={detail.week}
          createdAt={detail.created_at}
          isOpen={modalType === ModalTypeEnum.Update}
          onClose={() => setModalType(null)}
          onSubmit={update.trigger}
          isLoading={update.isMutating}
        />
      )}

      {reviewId && (
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

ReviewPage.getLayout = getProjectLayout;

export default ReviewPage;
