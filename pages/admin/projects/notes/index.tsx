import { useSearchParams } from 'next/navigation';
import NoteCard from '@/components/Note/Card';
import getAdminProjectLayout from '@/layout/AdminProjectLayout';
import {
  useProjectNoteList,
} from '@/hooks/api/project';
import { z } from 'zod';

const NotesPage = () => {
  const searchParams = useSearchParams();
  const projectIdParam = searchParams.get('id');
  const projectId =
    projectIdParam && z.string().uuid().safeParse(projectIdParam).success
      ? projectIdParam
      : undefined;

  const {
    data: notes,
  } = useProjectNoteList(projectId);

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
              detailLink={`/admin/projects/notes/detail?id=${projectId}&noteId=${note.id}`}
            />
          </li>
        ))}
      </ul>
    </>
  );
};

NotesPage.getLayout = getAdminProjectLayout;

export default NotesPage;
