import toast from 'react-hot-toast';
import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import NoteCard from '@/components/Note/Card';
import getProjectLayout from '@/layout/ProjectLayout';
import Button from '@/shared/components/Button';
import CreateModal from '@/components/Note/Modals/CreateModal';
import UpdateModal from '@/components/Note/Modals/UpdateModal';
import ConfirmModal from '@/shared/components/Confirm';
import {
  useProject,
  useProjectNote,
  useProjectNoteList,
} from '@/hooks/api/project';

enum ModalTypeEnum {
  Create = 'create',
  Update = 'update',
  Delete = 'delete',
}

const NotesPage = () => {
  const searchParams = useSearchParams();
  const projectId = searchParams.get('id') ?? undefined;
  const [modalType, setModalType] = useState<ModalTypeEnum | null>(null);
  const [noteId, setNoteId] = useState<number | undefined>(undefined);
  const { data: project } = useProject(projectId);

  const { data: detail, mutate } = useProjectNote({
    projectId,
    noteId,
  });

  const {
    data: notes,
    create,
    update,
    remove,
  } = useProjectNoteList(projectId, {
    onCreated: () => {
      toast.success('新增便利貼成功');
      setModalType(null);
    },
    onUpdated: () => {
      toast.success('覆盤更新成功');
      setModalType(null);
      setNoteId(undefined);
      mutate();
    },
    onDeleted: () => {
      toast.success('覆盤刪除成功');
      setModalType(null);
      setNoteId(undefined);
    },
  });

  if (!projectId) {
    return <div>專案不存在</div>;
  }

  return (
    <>
      <div className="mb-6 flex items-center justify-between body-md">
        <div className="text-basic-500">便利貼 ({notes?.length || 0})</div>
        <Button
          variant="solid"
          color="primary"
          onClick={() => setModalType(ModalTypeEnum.Create)}
        >
          新增便利貼
        </Button>
      </div>
      <ul className="px-4 bg-basic-white flex flex-col rounded-2xl">
        {notes?.map((note) => (
          <li
            key={note.id}
            className="py-6 border-b last:border-b-0 border-solid border-basic-200"
          >
            <NoteCard
              data={note}
              className="p-3 transition-shadow hover:shadow-basic-200/40 hover:shadow-lg"
              detailLink={`/manage/project/notes/detail?id=${projectId}&noteId=${note.id}`}
              onEditClick={() => {
                setModalType(ModalTypeEnum.Update);
                setNoteId(note.id);
              }}
              onDeleteClick={() => {
                setModalType(ModalTypeEnum.Delete);
                setNoteId(note.id);
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
          isLoading={create.isMutating}
          onSubmit={create.trigger}
        />
      )}

      {detail && noteId && project && (
        <UpdateModal
          key={noteId}
          id={noteId}
          isOpen={modalType === ModalTypeEnum.Update}
          onClose={() => setModalType(null)}
          projectId={projectId}
          projectTitle={project.title}
          week={detail.week}
          createdAt={detail.date}
          isLoading={update.isMutating}
          defaultValues={detail}
          onSubmit={update.trigger}
        />
      )}

      {noteId && (
        <ConfirmModal
          title="確認刪除便利貼"
          confirmText="確認刪除"
          confirmColor="alert"
          isOpen={modalType === ModalTypeEnum.Delete}
          onClose={() => setModalType(null)}
          onConfirm={() => remove.trigger({ projectId, noteId })}
          isLoading={remove.isMutating}
        />
      )}
    </>
  );
};

NotesPage.getLayout = getProjectLayout;

export default NotesPage;
