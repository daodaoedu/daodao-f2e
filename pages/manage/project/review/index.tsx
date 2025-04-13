import toast from 'react-hot-toast';
import { useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import getProjectLayout from '@/layout/ProjectLayout';
import Button from '@/shared/components/Button';
import ReviewCard from '@/components/Review/Card';
import CreateModal from '@/components/Review/Modals/CreateModal';
import SEOConfig from '@/shared/components/SEO';
import UpdateModal from '@/components/Review/Modals/UpdateModal';
import {
  useProject,
  useProjectReview,
  useProjectReviews,
  useProjectReviewMutation,
} from '@/services/modules/projects';
import ConfirmModal from '@/shared/components/Confirm';
import marathonConfig from '@/constants/marathon';
import { parseToString } from '@/services/core';

enum ModalTypeEnum {
  Create,
  Update,
  Delete,
}

const ReviewPage = () => {
  const { query } = useRouter();
  const projectId = parseToString(query.id);
  const [modalType, setModalType] = useState<ModalTypeEnum | null>(null);
  const [reviewId, setReviewId] = useState<number | undefined>(undefined);
  const { data: project } = useProject(projectId);

  const { data: reviews, mutate } = useProjectReviews(projectId);

  const { data: detail } = useProjectReview({
    projectId,
    reviewId,
  });

  const { createMutation, updateMutation, deleteMutation } =
    useProjectReviewMutation({
      projectId,
      reviewId,
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

  const SEOData = useMemo(
    () => ({
      title: `${project?.title} 覆盤｜島島阿學`,
      description:
        project?.description?.substring(0, 150) ||
        '「島島阿學」盼能透過建立多元的學習資源網絡，讓自主學習者能找到合適的成長方法，進一步成為自己想成為的人，從中培養共好精神。目前正積極打造「可共編的學習資源平台」。',
      keywords: '島島阿學',
      author: '島島阿學',
      copyright: '島島阿學',
      imgLink: 'https://www.daoedu.tw/preview.webp',
      link: `${process.env.HOSTNAME}/manage/project/review?id=${projectId}`,
    }),
    [project?.title, project?.description, projectId]
  );

  if (!projectId) {
    return <div>專案不存在</div>;
  }

  return (
    <>
      <SEOConfig data={SEOData} />
      <div className="mb-6 flex items-end sm:items-center justify-between body-md">
        <div className="flex flex-col items-start sm:flex-row sm:items-center gap-1">
          <div className="text-basic-500">
            覆盤（{marathonConfig.getWeekNumber().toString().padStart(2, '0')}{' '}
            週/22週）
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
