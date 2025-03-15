import { z } from 'zod';
import { useRouter, useSearchParams } from 'next/navigation';
import NoteDetail from '@/components/Note/Detail';
import getPublicProjectLayout from '@/layout/PublicProjectLayout';
import { useProjectNote } from '@/services/modules/projects';

const NoteDetailPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const projectId = searchParams.get('id');
  const noteId = z.number().safeParse(searchParams.get('noteId')).data;

  const { data: note } = useProjectNote({
    projectId,
    noteId,
  });

  if (!projectId || noteId == null) {
    router.replace(`/projects/notes?id=${projectId}`);
    return null;
  }
  return (
    <div className="bg-basic-white rounded-2xl">
      <NoteDetail data={note} />
    </div>
  );
};

NoteDetailPage.getLayout = getPublicProjectLayout;

export default NoteDetailPage;
