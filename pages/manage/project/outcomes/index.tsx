import toast from 'react-hot-toast';
import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import OutcomeCard from '@/components/Outcome/Card';
import getProjectLayout from '@/layout/ProjectLayout';
import Button from '@/shared/components/Button';
import CreateModal from '@/components/Outcome/Modals/CreateModal';
import UpdateModal from '@/components/Outcome/Modals/UpdateModal';
import ConfirmModal from '@/shared/components/Confirm';
import { useProject } from '@/services/modules/projects';
import {
  useProjectOutcome,
  useProjectOutcomeList,
} from '@/hooks/api/project';

enum ModalTypeEnum {
  Create,
  Update,
  Delete,
}

const OutcomesPage = () => {
  const searchParams = useSearchParams();
  const projectId = searchParams.get('id');
  const [modalType, setModalType] = useState<ModalTypeEnum | null>(null);
  const [outcomeId, setOutcomeId] = useState<number | undefined>(undefined);
  const { data: project } = useProject(projectId);

  const { data: detail, mutate } = useProjectOutcome({
    projectId: projectId ?? undefined,
    outcomeId,
  });

  const {
    data: outcomes,
    createMutation,
    updateMutation,
    deleteMutation,
  } = useProjectOutcomeList(projectId ?? undefined, {
    onCreated: () => {
      toast.success('新增成功');
      setModalType(null);
    },
    onUpdated: () => {
      toast.success('更新成功');
      setModalType(null);
      setOutcomeId(undefined);
      mutate();
    },
    onDeleted: () => {
      toast.success('刪除成功');
      setModalType(null);
      setOutcomeId(undefined);
    },
  });

  if (!projectId) {
    return <div>專案不存在</div>;
  }

  return (
    <>
      <div className="mb-6 flex items-center justify-between body-md">
        <div className="text-basic-500">學習成果 ({outcomes?.length ?? 0})</div>
        <Button
          variant="solid"
          color="primary"
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
            <OutcomeCard
              data={outcome}
              className="p-3 transition-shadow hover:shadow-basic-200/40 hover:shadow-lg"
              detailLink={`/manage/project/outcomes/detail?id=${projectId}&outcomeId=${outcome.id}`}
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
        <CreateModal
          isOpen={modalType === ModalTypeEnum.Create}
          onClose={() => setModalType(null)}
          projectId={projectId}
          projectTitle={project.title}
          isLoading={createMutation.isMutating}
          onSubmit={createMutation.trigger}
        />
      )}

      {detail && outcomeId && project && (
        <UpdateModal
          key={outcomeId}
          id={outcomeId}
          isOpen={modalType === ModalTypeEnum.Update}
          onClose={() => setModalType(null)}
          projectId={projectId}
          projectTitle={project.title}
          week={detail.week}
          createdAt={detail.date}
          isLoading={updateMutation.isMutating}
          defaultValues={detail}
          onSubmit={updateMutation.trigger}
        />
      )}

      {outcomeId && (
        <ConfirmModal
          title="確認刪除學習成果"
          confirmText="確認刪除"
          confirmColor="alert"
          isOpen={modalType === ModalTypeEnum.Delete}
          onClose={() => setModalType(null)}
          onConfirm={() => deleteMutation.trigger({ projectId, outcomeId })}
          isLoading={deleteMutation.isMutating}
        />
      )}
    </>
  );
};

OutcomesPage.getLayout = getProjectLayout;

export default OutcomesPage;
