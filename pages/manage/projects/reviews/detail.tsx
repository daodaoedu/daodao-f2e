import { toast } from 'react-hot-toast';
import { useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import { getManageProjectLayout } from '@/layout/features/getProjectLayout';
import SEOConfig from '@/shared/components/SEO';
import ReviewDetail from '@/components/Review/Detail';
import UpdateModal from '@/components/Review/Modals/UpdateModal';
import {
  useProject,
  useProjectReview,
  useProjectReviewMutation,
} from '@/services/modules/projects';
import ConfirmModal from '@/shared/components/Confirm';
import { parseToNumber, parseToString } from '@/services/core';

enum ModalTypeEnum {
  Update,
  Delete,
}

const ReviewPage = () => {
  const router = useRouter();
  const { query } = router;
  const projectId = parseToString(query.id);
  const reviewId = parseToNumber(query.reviewId);
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
      router.replace(`/manage/projects/review?id=${projectId}`);
    },
  });

  const SEOData = useMemo(
    () => ({
      title: `${review?.title} 覆盤｜島島阿學`,
      description:
        review?.adjustmentPlan?.substring(0, 150) ||
        '「島島阿學」盼能透過建立多元的學習資源網絡，讓自主學習者能找到合適的成長方法，進一步成為自己想成為的人，從中培養共好精神。目前正積極打造「可共編的學習資源平台」。',
      keywords: '島島阿學',
      author: '島島阿學',
      copyright: '島島阿學',
      imgLink: 'https://www.daoedu.tw/preview.webp',
      link: `${process.env.HOSTNAME}/manage/projects/review?id=${projectId}&reviewId=${reviewId}`,
    }),
    [review?.title, review?.adjustmentPlan, projectId, reviewId]
  );

  if (!projectId || reviewId == null) {
    return null;
  }

  return (
    <>
      <SEOConfig data={SEOData} />

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

ReviewPage.getLayout = getManageProjectLayout;

export default ReviewPage;
