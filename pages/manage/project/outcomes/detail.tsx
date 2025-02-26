import toast from 'react-hot-toast';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import OutcomeDetail from '@/components/Outcome/Detail';
import getProjectLayout from '@/layout/ProjectLayout';
import { useProject, useProjectOutcome } from '@/hooks/api/project';
import ConfirmModal from '@/shared/components/Confirm';
import EditModal from '@/components/Outcome/Modals/UpdateModal';

enum ModalTypeEnum {
  Update,
  Delete,
}

const OutcomeDetailPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const projectId = searchParams.get('id') ?? undefined;
  const outcomeId = parseInt(searchParams.get('outcomeId') ?? '0', 10);
  const [modalType, setModalType] = useState<ModalTypeEnum | null>(null);
  const { data: project } = useProject({ id: projectId });
  const {
    data: outcome,
    update,
    remove,
  } = useProjectOutcome({
    projectId,
    outcomeId,
    onUpdated: () => {
      toast.success('更新成功');
      setModalType(null);
    },
    onDeleted: () => {
      toast.success('刪除成功');
      router.replace(`/manage/project/outcomes?id=${projectId}`);
    },
  });

  if (!projectId || !outcomeId) {
    router.replace(`/manage/project/outcomes?id=${projectId}`);
    return null;
  }

  return (
    <div className="bg-basic-white rounded-2xl">
      <OutcomeDetail
        data={outcome}
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
          onSubmit={update.trigger}
          isLoading={update.isMutating}
        />
      )}

      <ConfirmModal
        title="確認刪除成果"
        confirmText="確認刪除"
        confirmColor="alert"
        isOpen={modalType === ModalTypeEnum.Delete}
        onClose={() => setModalType(null)}
        onConfirm={() => remove.trigger({ projectId, outcomeId })}
        isLoading={remove.isMutating}
      />
    </div>
  );
};

OutcomeDetailPage.getLayout = (page: React.ReactElement) =>
  getProjectLayout(page, 'outcomes');

export default OutcomeDetailPage;
