'use client';

import toast from 'react-hot-toast';
import { useRouter, useSearchParams } from 'next/navigation';
import { useMemo, useState, Suspense } from 'react';
import { NoteDetail, NoteUpdateModal } from '@/features/projects';
import SEOConfig from '@/components/SEOConfig';
import {
  useProject,
  useProjectNote,
  useProjectNoteMutation,
} from '@/services/projects';
import { parseToNumber, parseToString } from '@/shared/lib/helper';
import ConfirmModal from '@/shared/components/Confirm';
import { LazyCommentSection } from '@/features/comment';
import { CommentType } from '@/services/comments';

enum ModalTypeEnum {
  Update,
  Delete,
}

function NoteDetailPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const projectId = parseToString(searchParams?.get('id'));
  const noteId = parseToNumber(searchParams?.get('noteId'));
  const [modalType, setModalType] = useState<ModalTypeEnum | null>(null);
  const { data: project } = useProject(projectId);
  const { data: note } = useProjectNote({
    projectId,
    noteId,
  });

  const { deleteMutation } = useProjectNoteMutation({
    projectId,
    noteId,
    onDeleted: () => {
      toast.success('刪除成功');
      router.replace(`/manage/projects/notes?id=${projectId}`);
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
      imgLink: 'https://www.daoedu.tw/assets/brand/horizontal-primary-logo.svg',
      link: `${process.env.PROD_URL}/manage/projects/notes/detail?id=${projectId}&noteId=${noteId}`,
    }),
    [note?.title, note?.content, projectId, noteId]
  );

  if (!projectId || noteId == null) {
    return null;
  }

  return (
    <div className="rounded-2xl bg-basic-white">
      <SEOConfig {...SEOData} />
      <NoteDetail
        data={note}
        authorUser={project?.user}
        commentSection={
          <LazyCommentSection targetId={noteId} targetType={CommentType.Note} />
        }
        onEditClick={() => setModalType(ModalTypeEnum.Update)}
        onDeleteClick={() => setModalType(ModalTypeEnum.Delete)}
      />

      {note && project && (
        <NoteUpdateModal
          noteId={noteId}
          projectId={projectId}
          projectTitle={project.title}
          isOpen={modalType === ModalTypeEnum.Update}
          onClose={() => setModalType(null)}
          onSuccess={() => {
            toast.success('更新成功');
            setModalType(null);
          }}
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
}

export default function NoteDetailPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <NoteDetailPageContent />
    </Suspense>
  );
}
