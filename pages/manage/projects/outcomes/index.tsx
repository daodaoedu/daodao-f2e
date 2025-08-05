import toast from "react-hot-toast";
import { useMemo, useState } from "react";
import { useRouter } from "next/router";
import SEOConfig from "@/components/SEOConfig";
import {
  ContentCard,
  OutcomeCreateModal,
  OutcomeDeleteModal,
  OutcomeUpdateModal,
} from "@/features/projects";
import { getManageProjectLayout } from "@/layout/features/getProjectLayout";
import { Button } from "@/components/ui/button";
import { useProject } from "@/services/projects";
import {
  useProjectOutcome,
  useProjectOutcomes,
} from "@/features/projects/hooks/outcome";
import { parseToString } from "@/utils/helper";

enum ModalTypeEnum {
  Create,
  Update,
  Delete,
}

const OutcomesPage = () => {
  const { query } = useRouter();
  const projectId = parseToString(query.id);
  const [modalType, setModalType] = useState<ModalTypeEnum | null>(null);
  const [outcomeId, setOutcomeId] = useState<number | null>(null);
  const { data: project } = useProject(projectId);

  const { data: outcomes } = useProjectOutcomes(projectId);

  const { data: detail } = useProjectOutcome({
    projectId,
    outcomeId,
  });

  const SEOData = useMemo(
    () => ({
      title: `${project?.title} 學習成果｜島島阿學`,
      description:
        project?.description?.substring(0, 150) ||
        "「島島阿學」盼能透過建立多元的學習資源網絡，讓自主學習者能找到合適的成長方法，進一步成為自己想成為的人，從中培養共好精神。目前正積極打造「可共編的學習資源平台」。",
      keywords: "島島阿學",
      author: "島島阿學",
      copyright: "島島阿學",
      imgLink: "https://www.daoedu.tw/preview.webp",
      link: `${process.env.HOSTNAME}/manage/projects/outcomes?id=${projectId}`,
    }),
    [project?.title, project?.description, projectId]
  );

  if (!projectId) {
    return <div>專案不存在</div>;
  }

  return (
    <>
      <SEOConfig {...SEOData} />
      <div className="mb-6 flex items-center justify-between body-md">
        <div className="text-basic-500">學習成果 ({outcomes?.length ?? 0})</div>
        <Button
          variant="default"
          onClick={() => setModalType(ModalTypeEnum.Create)}
        >
          新增成果
        </Button>
      </div>
      <ul className="px-4 bg-basic-white flex flex-col rounded-2xl">
        {outcomes?.map((outcome) => (
          <li
            key={outcome.id}
            className="py-6 border-b last:border-b-0 border-solid border-basic-200"
          >
            <ContentCard
              type="outcome"
              data={outcome}
              className="p-3 transition-shadow hover:shadow-basic-200/40 hover:shadow-lg"
              detailLink={`/manage/projects/outcomes/detail?id=${projectId}&outcomeId=${outcome.id}`}
              onEditClick={() => {
                setModalType(ModalTypeEnum.Update);
                setOutcomeId(outcome.id);
              }}
              onDeleteClick={() => {
                setModalType(ModalTypeEnum.Delete);
                setOutcomeId(outcome.id);
              }}
            />
          </li>
        ))}
      </ul>

      {project && (
        <OutcomeCreateModal
          isOpen={modalType === ModalTypeEnum.Create}
          onClose={() => setModalType(null)}
          projectId={projectId}
          projectTitle={project.title}
          onSuccess={() => {
            toast.success("新增成功");
            setModalType(null);
          }}
        />
      )}

      {detail && outcomeId && project && (
        <OutcomeUpdateModal
          key={outcomeId}
          isOpen={modalType === ModalTypeEnum.Update}
          onClose={() => setModalType(null)}
          projectId={projectId}
          projectTitle={project.title}
          outcomeId={outcomeId}
          onSuccess={() => {
            toast.success("更新成功");
            setModalType(null);
            setOutcomeId(null);
          }}
        />
      )}

      {outcomeId && (
        <OutcomeDeleteModal
          isOpen={modalType === ModalTypeEnum.Delete}
          projectId={projectId}
          outcomeId={outcomeId}
          onClose={() => setModalType(null)}
          onSuccess={() => {
            toast.success("刪除成功");
            setModalType(null);
            setOutcomeId(null);
          }}
        />
      )}
    </>
  );
};

OutcomesPage.getLayout = getManageProjectLayout;

export default OutcomesPage;
