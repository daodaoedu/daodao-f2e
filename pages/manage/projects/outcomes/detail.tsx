import toast from 'react-hot-toast';
import { useRouter } from 'next/router';
import { useMemo, useState } from 'react';
import OutcomeDetail from '@/components/Outcome/Detail';
import { getManageProjectLayout } from '@/layout/features/getProjectLayout';
import SEOConfig from '@/shared/components/SEO';
import {
  useProject,
  useProjectOutcome,
  useProjectOutcomeMutation,
} from '@/services/modules/projects';
import { parseToNumber, parseToString } from '@/services/core';
import ConfirmModal from '@/shared/components/Confirm';
import EditModal from '@/components/Outcome/Modals/UpdateModal';

enum ModalTypeEnum {
  Update,
  Delete,
}

const OutcomeDetailPage = () => {
  const router = useRouter();
  const { query } = router;
  const projectId = parseToString(query.id);
  const outcomeId = parseToNumber(query.outcomeId);
  const [modalType, setModalType] = useState<ModalTypeEnum | null>(null);
  const { data: project } = useProject(projectId);
  const { data: outcome } = useProjectOutcome({
    projectId,
    outcomeId,
  });

  const { updateMutation, deleteMutation } = useProjectOutcomeMutation({
    projectId,
    outcomeId,
    onUpdated: () => {
      toast.success('更新成功');
      setModalType(null);
    },
    onDeleted: () => {
      toast.success('刪除成功');
      router.replace(`/manage/projects/outcomes?id=${projectId}`);
    },
  });

  const SEOData = useMemo(
    () => ({
      title: `${outcome?.title} 學習成果｜島島阿學`,
      description:
        outcome?.content?.substring(0, 150) ||
        '「島島阿學」盼能透過建立多元的學習資源網絡，讓自主學習者能找到合適的成長方法，進一步成為自己想成為的人，從中培養共好精神。目前正積極打造「可共編的學習資源平台」。',
      keywords: '島島阿學',
      author: '島島阿學',
      copyright: '島島阿學',
      imgLink: 'https://www.daoedu.tw/preview.webp',
      link: `${process.env.HOSTNAME}/manage/projects/outcomes?id=${projectId}&outcomeId=${outcomeId}`,
    }),
    [outcome?.title, outcome?.content, projectId, outcomeId]
  );

  if (!projectId || outcomeId == null) {
    return null;
  }

  return (
    <div className="bg-basic-white rounded-2xl">
      <SEOConfig {...SEOData} />
      <OutcomeDetail
        data={outcome}
        authorUser={project?.user}
        onEditClick={() => setModalType(ModalTypeEnum.Update)}
        onDeleteClick={() => setModalType(ModalTypeEnum.Delete)}
      />

      {outcome && project && (
        <EditModal
          id={outcomeId}
          projectId={projectId}
          projectTitle={project.title}
          defaultValues={outcome}
          week={outcome.week}
          createdAt={outcome.date}
          isOpen={modalType === ModalTypeEnum.Update}
          onClose={() => setModalType(null)}
          onSubmit={updateMutation.trigger}
          isLoading={updateMutation.isMutating}
        />
      )}

      <ConfirmModal
        title="確認刪除成果"
        confirmText="確認刪除"
        confirmColor="alert"
        isOpen={modalType === ModalTypeEnum.Delete}
        onClose={() => setModalType(null)}
        onConfirm={() => deleteMutation.trigger({ projectId, outcomeId })}
        isLoading={deleteMutation.isMutating}
      />
    </div>
  );
};

OutcomeDetailPage.getLayout = getManageProjectLayout;

export default OutcomeDetailPage;
