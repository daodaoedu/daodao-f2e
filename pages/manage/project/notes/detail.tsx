import toast from 'react-hot-toast';
import { useRouter } from 'next/router';
import { useMemo, useState } from 'react';
import NoteDetail from '@/components/Note/Detail';
import SEOConfig from '@/shared/components/SEO';
import getProjectLayout from '@/layout/ProjectLayout';
import {
  useProject,
  useProjectNote,
  useProjectNoteMutation,
} from '@/services/modules/projects';
import { parseToNumber, parseToString } from '@/services/core';
import ConfirmModal from '@/shared/components/Confirm';
import UpdateModal from '@/components/Note/Modals/UpdateModal';

enum ModalTypeEnum {
  Update,
  Delete,
}

const NoteDetailPage = () => {
  const router = useRouter();
  const { query } = router;
  const projectId = parseToString(query.id);
  const noteId = parseToNumber(query.noteId);
  const [modalType, setModalType] = useState<ModalTypeEnum | null>(null);
  const { data: project } = useProject(projectId);
  const { data: note } = useProjectNote({
    projectId,
    noteId,
  });

  const { updateMutation, deleteMutation } = useProjectNoteMutation({
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

  const SEOData = useMemo(
    () => ({
      title: `${note?.title} 便利貼｜島島阿學`,
      description:
        note?.content?.substring(0, 150) ||
        '「島島阿學」盼能透過建立多元的學習資源網絡，讓自主學習者能找到合適的成長方法，進一步成為自己想成為的人，從中培養共好精神。目前正積極打造「可共編的學習資源平台」。',
      keywords: '島島阿學',
      author: '島島阿學',
      copyright: '島島阿學',
      imgLink: 'https://www.daoedu.tw/preview.webp',
      link: `${process.env.HOSTNAME}/manage/project/notes?id=${projectId}&noteId=${noteId}`,
    }),
    [note?.title, note?.content, projectId, noteId]
  );

  if (!projectId || noteId == null) {
    return null;
  }

  return (
    <div className="bg-basic-white rounded-2xl">
      <SEOConfig data={SEOData} />
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
          onSubmit={updateMutation.trigger}
          isLoading={updateMutation.isMutating}
        />
      )}

      <ConfirmModal
        title="確認刪除便利貼"
        confirmText="確認刪除"
        confirmColor="alert"
        isOpen={modalType === ModalTypeEnum.Delete}
        onClose={() => setModalType(null)}
        onConfirm={() => deleteMutation.trigger({ projectId, noteId })}
        isLoading={deleteMutation.isMutating}
      />
    </div>
  );
};

NoteDetailPage.getLayout = (page: React.ReactElement) =>
  getProjectLayout(page, 'notes');

export default NoteDetailPage;
