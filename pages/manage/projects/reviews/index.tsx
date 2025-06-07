import toast from "react-hot-toast";
import { useMemo, useState } from "react";
import { useRouter } from "next/router";
import { getManageProjectLayout } from "@/layout/features/getProjectLayout";
import { Button } from "@/components/atoms/button";
import ReviewCard from "@/features/projects/components/ReviewCard";
import {
  ReviewCreateModal,
  ReviewDeleteModal,
  ReviewUpdateModal,
} from "@/features/projects";
import SEOConfig from "@/shared/components/SEO";
import { useProject } from "@/services/projects";
import { useProjectReview, useProjectReviewList } from "@/features/projects/hooks/review";
import marathonConfig from "@/constants/marathon";
import { parseToString } from "@/utils/helper";

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

  const { data: reviews } = useProjectReviewList(projectId);

  const { data: detail } = useProjectReview({
    projectId,
    reviewId,
  });

  const SEOData = useMemo(
    () => ({
      title: `${project?.title} 覆盤｜島島阿學`,
      description:
        project?.description?.substring(0, 150) ||
        "「島島阿學」盼能透過建立多元的學習資源網絡，讓自主學習者能找到合適的成長方法，進一步成為自己想成為的人，從中培養共好精神。目前正積極打造「可共編的學習資源平台」。",
      keywords: "島島阿學",
      author: "島島阿學",
      copyright: "島島阿學",
      imgLink: "https://www.daoedu.tw/preview.webp",
      link: `${process.env.HOSTNAME}/manage/projects/review?id=${projectId}`,
    }),
    [project?.title, project?.description, projectId]
  );

  if (!projectId) {
    return <div>專案不存在</div>;
  }

  return (
    <>
      <SEOConfig {...SEOData} />
      <div className="mb-6 flex items-end sm:items-center justify-between body-md">
        <div className="flex flex-col items-start sm:flex-row sm:items-center gap-1">
          <div className="text-basic-500">
            覆盤（{marathonConfig.getWeekNumber().toString().padStart(2, "0")}{" "}
            週/22週）
          </div>
        </div>
        <Button
          variant="default"
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
                detailLink={`/manage/projects/reviews/detail?id=${projectId}&reviewId=${review.id}`}
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
        <ReviewCreateModal
          projectId={projectId}
          projectTitle={project.title}
          isOpen={modalType === ModalTypeEnum.Create}
          onClose={() => setModalType(null)}
          onSuccess={() => {
            toast.success("新增成功");
            setModalType(null);
          }}
        />
      )}

      {detail && reviewId && project && (
        <ReviewUpdateModal
          projectId={projectId}
          projectTitle={project.title}
          reviewId={reviewId}
          isOpen={modalType === ModalTypeEnum.Update}
          onClose={() => setModalType(null)}
          onSuccess={() => {
            toast.success("更新成功");
            setModalType(null);
            setReviewId(undefined);
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
            setModalType(null);
            setReviewId(undefined);
          }}
        />
      )}
    </>
  );
};

ReviewPage.getLayout = getManageProjectLayout;

export default ReviewPage;
