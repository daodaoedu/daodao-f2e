import { useRouter, useSearchParams } from 'next/navigation';
import NoteDetail from '@/components/Note/Detail';
import getPublicProjectLayout from '@/layout/PublicProjectLayout';
import { useProjectNote } from '@/hooks/api/project';

const NoteDetailPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const projectId = searchParams.get('id') ?? undefined;
  const noteId = parseInt(searchParams.get('noteId') ?? '0', 10);
  const {
    data: note,
  } = useProjectNote({
    projectId,
    noteId,
  });

  if (!projectId || !noteId) {
    router.replace(`/projects/notes?id=${projectId}`);
    return null;
  }
  return (
    <div className="bg-basic-white rounded-2xl">
      <NoteDetail
        data={note}
      />
    </div>
  );
};

NoteDetailPage.getLayout = getPublicProjectLayout;

export default NoteDetailPage;
