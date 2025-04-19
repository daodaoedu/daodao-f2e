import toast from 'react-hot-toast';
import { useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import { ContentCard } from '@/features/projects';
import getProjectLayout from '@/layout/ProjectLayout';
import Button from '@/shared/components/Button';
import SEOConfig from '@/shared/components/SEO';
import CreateModal from '@/components/Note/Modals/CreateModal';
import UpdateModal from '@/components/Note/Modals/UpdateModal';
import ConfirmModal from '@/shared/components/Confirm';
import {
  useProject,
  useProjectNote,
  useProjectNoteMutation,
  useProjectNotes,
} from '@/services/modules/projects';
import { parseToString } from '@/services/core';

enum ModalTypeEnum {
  Create,
  Update,
  Delete,
}

const NotesPage = () => {
  const { query } = useRouter();
  const projectId = parseToString(query.id);
  const [modalType, setModalType] = useState<ModalTypeEnum | null>(null);
  const [noteId, setNoteId] = useState<number | null>(null);
  const { data: project } = useProject(projectId);

  const { data: notes, mutate } = useProjectNotes(projectId);

  const { data: detail } = useProjectNote({
    projectId,
    noteId,
  });

  const { createMutation, updateMutation, deleteMutation } =
    useProjectNoteMutation({
      projectId,
      noteId,
      onCreated: () => {
        toast.success('新增成功');
        setModalType(null);
        mutate();
      },
      onUpdated: () => {
        toast.success('更新成功');
        setModalType(null);
        setNoteId(null);
        mutate();
      },
      onDeleted: () => {
        toast.success('刪除成功');
        setModalType(null);
        setNoteId(null);
        mutate();
      },
    });

  const SEOData = useMemo(
    () => ({
      title: `${project?.title} 便利貼｜島島阿學`,
      description:
        project?.description?.substring(0, 150) ||
        '「島島阿學」盼能透過建立多元的學習資源網絡，讓自主學習者能找到合適的成長方法，進一步成為自己想成為的人，從中培養共好精神。目前正積極打造「可共編的學習資源平台」。',
      keywords: '島島阿學',
      author: '島島阿學',
      copyright: '島島阿學',
      imgLink: 'https://www.daoedu.tw/preview.webp',
      link: `${process.env.HOSTNAME}/manage/project/notes?id=${projectId}`,
    }),
    [project?.title, project?.description, projectId]
  );

  if (!projectId) {
    return <div>專案不存在</div>;
  }

  return (
    <>
      <SEOConfig data={SEOData} />
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
            <ContentCard
              type="note"
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
          isLoading={createMutation.isMutating}
          onSubmit={createMutation.trigger}
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
          isLoading={updateMutation.isMutating}
          defaultValues={detail}
          onSubmit={updateMutation.trigger}
        />
      )}

      {noteId && (
        <ConfirmModal
          title="確認刪除便利貼"
          confirmText="確認刪除"
          confirmColor="alert"
          isOpen={modalType === ModalTypeEnum.Delete}
          onClose={() => setModalType(null)}
          onConfirm={() => deleteMutation.trigger({ projectId, noteId })}
          isLoading={deleteMutation.isMutating}
        />
      )}
    </>
  );
};

NotesPage.getLayout = getProjectLayout;

export default NotesPage;
