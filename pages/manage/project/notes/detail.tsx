import toast from 'react-hot-toast';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import NoteDetail from '@/components/Note/Detail';
import getProjectLayout from '@/layout/ProjectLayout';
import { useProject, useProjectNote } from '@/hooks/api/project';
import ConfirmModal from '@/shared/components/Confirm';
import UpdateModal from '@/components/Note/Modals/UpdateModal';

enum ModalTypeEnum {
  Update,
  Delete,
}

const NoteDetailPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const projectId = searchParams.get('id') ?? undefined;
  const noteId = parseInt(searchParams.get('noteId') ?? '0', 10);
  const [modalType, setModalType] = useState<ModalTypeEnum | null>(null);
  const { data: project } = useProject({ id: projectId });
  const {
    data: note,
    updateMutation: updateNote,
    deleteMutation: removeNote,
  } = useProjectNote({
    projectId,
    noteId,
    onUpdated: () => {
      toast.success('更新成功');
      setModalType(null);
    },
    onDeleted: () => {
      toast.success('刪除成功');
      router.replace(`/manage/project/notes?id=${projectId}`);
    },
  });

  if (!projectId || !noteId) {
    return null;
  }

  return (
    <div className="bg-basic-white rounded-2xl">
      <NoteDetail
        data={note}
        authorUser={project?.user}
        onEditClick={() => setModalType(ModalTypeEnum.Update)}
        onDeleteClick={() => setModalType(ModalTypeEnum.Delete)}
      />

      {note && project && (
        <UpdateModal
          id={noteId}
          projectId={projectId}
          projectTitle={project.title}
          defaultValues={note}
          week={note.week}
          createdAt={note.date}
          isOpen={modalType === ModalTypeEnum.Update}
          onClose={() => setModalType(null)}
          onSubmit={updateNote.trigger}
          isLoading={updateNote.isMutating}
        />
      )}

      <ConfirmModal
        title="確認刪除便利貼"
        confirmText="確認刪除"
        confirmColor="alert"
        isOpen={modalType === ModalTypeEnum.Delete}
        onClose={() => setModalType(null)}
        onConfirm={() => removeNote.trigger({ projectId, noteId })}
        isLoading={removeNote.isMutating}
      />
    </div>
  );
};

NoteDetailPage.getLayout = (page: React.ReactElement) =>
  getProjectLayout(page, 'notes');

export default NoteDetailPage;
