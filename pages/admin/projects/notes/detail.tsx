import { useRouter, useSearchParams } from 'next/navigation';
import NoteDetail from '@/components/Note/Detail';
import getAdminProjectLayout from '@/layout/AdminProjectLayout';
import { useProjectNote } from '@/services/modules/projects';
import { parseParamsToNumber } from '@/services/core';

const NoteDetailPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const projectId = searchParams.get('id');
  const noteId = parseParamsToNumber(searchParams.get('noteId'));

  const { data: note } = useProjectNote({
    projectId,
    noteId,
  });

  if (!projectId || noteId == null) {
    router.replace(`/admin/projects/notes?id=${projectId}`);
    return null;
  }
  return (
    <div className="bg-basic-white rounded-2xl">
      <NoteDetail data={note} />
    </div>
  );
};

NoteDetailPage.getLayout = getAdminProjectLayout;

export default NoteDetailPage;
