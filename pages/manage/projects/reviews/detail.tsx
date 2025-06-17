import { toast } from "react-hot-toast";
import { useMemo, useState } from "react";
import { useRouter } from "next/router";
import { getManageProjectLayout } from "@/layout/features/getProjectLayout";
import SEOConfig from "@/shared/components/SEO";
import ReviewDetail from "@/features/projects/components/ReviewDetail";
import { ReviewDeleteModal, ReviewUpdateModal } from "@/features/projects";
import { useProject } from "@/services/projects";
import { useProjectReview } from "@/features/projects/hooks/review";
import { parseToNumber, parseToString } from "@/utils/helper";

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

  const SEOData = useMemo(
    () => ({
      title: `${review?.title} 覆盤｜島島阿學`,
      description:
        review?.adjustmentPlan?.substring(0, 150) ||
        "「島島阿學」盼能透過建立多元的學習資源網絡，讓自主學習者能找到合適的成長方法，進一步成為自己想成為的人，從中培養共好精神。目前正積極打造「可共編的學習資源平台」。",
      keywords: "島島阿學",
      author: "島島阿學",
      copyright: "島島阿學",
      imgLink: "https://www.daoedu.tw/preview.webp",
      link: `${process.env.HOSTNAME}/manage/projects/review?id=${projectId}&reviewId=${reviewId}`,
    }),
    [review?.title, review?.adjustmentPlan, projectId, reviewId]
  );

  if (!projectId || reviewId == null) {
    return null;
  }

  return (
    <>
      <SEOConfig {...SEOData} />

      <ReviewDetail
        data={review}
        authorUser={project?.user}
        onEditClick={() => setModalType(ModalTypeEnum.Update)}
        onDeleteClick={() => setModalType(ModalTypeEnum.Delete)}
      />

      {review && project && (
        <ReviewUpdateModal
          projectId={projectId}
          projectTitle={project.title}
          reviewId={reviewId}
          isOpen={modalType === ModalTypeEnum.Update}
          onClose={() => setModalType(null)}
          onSuccess={() => {
            toast.success("更新成功");
            setModalType(null);
          }}
        />
      )}

      {reviewId && (
        <ReviewDeleteModal
          projectId={projectId}
          reviewId={reviewId}
          isOpen={modalType === ModalTypeEnum.Delete}
          onClose={() => setModalType(null)}
          onSuccess={() => {
            toast.success("刪除成功");
            router.replace(`/manage/projects/review?id=${projectId}`);
          }}
        />
      )}
    </>
  );
};

ReviewPage.getLayout = getManageProjectLayout;

export default ReviewPage;
