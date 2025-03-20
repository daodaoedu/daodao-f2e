import { z } from 'zod';
import { useSearchParams } from 'next/navigation';
import NoteCard from '@/components/Note/Card';
import getPublicProjectLayout from '@/layout/PublicProjectLayout';
import { useProjectNotes } from '@/services/modules/projects';

const NotesPage = () => {
  const searchParams = useSearchParams();
  const projectId = z.string().uuid().safeParse(searchParams.get('id')).data;

  const { data: notes } = useProjectNotes(projectId);

  if (!projectId) {
    return <div>專案不存在</div>;
  }

  return (
    <>
      <ul className="px-4 bg-basic-white flex flex-col rounded-2xl">
        {notes?.map((note) => (
          <li
            key={note.id}
            className="py-6 border-b last:border-b-0 border-solid border-basic-200"
          >
            <NoteCard
              data={note}
              className="p-3 transition-shadow hover:shadow-basic-200/40 hover:shadow-lg"
              detailLink={`/projects/notes/detail?id=${projectId}&noteId=${note.id}`}
            />
          </li>
        ))}
      </ul>
    </>
  );
};

NotesPage.getLayout = getPublicProjectLayout;

export default NotesPage;
