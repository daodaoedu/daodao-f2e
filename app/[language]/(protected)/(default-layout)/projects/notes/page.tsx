'use client';

import { useSearchParams } from 'next/navigation';
import { ContentCard } from '@/features/projects';
import { useProjectNotes } from '@/services/projects';
import { parseToString } from '@/shared/lib/helper';
import EmptyList from '@/components/Projects/ProjectList/EmptyList';

export default function NotesPage() {
  const searchParams = useSearchParams();
  const projectId = parseToString(searchParams?.get('id'));

  const { data: notes } = useProjectNotes(projectId);

  if (!projectId) {
    return <div>專案不存在</div>;
  }

  if (!notes || notes.length === 0) {
    return (
      <div className="rounded-2xl overflow-hidden">
        <EmptyList />
      </div>
    );
  }

  return (
    <>
      <ul className="px-4 bg-basic-white flex flex-col rounded-2xl">
        {notes.map((note) => (
          <li
            key={note.id}
            className="py-6 border-b last:border-b-0 border-solid border-basic-200"
          >
            <ContentCard
              type="note"
              data={note}
              className="p-3"
            />
          </li>
        ))}
      </ul>
    </>
  );
}
