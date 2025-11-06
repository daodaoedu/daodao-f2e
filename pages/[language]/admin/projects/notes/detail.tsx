import { useSearchParams } from "next/navigation";
import { NoteDetail } from "@/features/projects";
import { getAdminProjectLayout } from "@/layout/features/getProjectLayout";
import { useProjectNote } from "@/services/projects";
import { parseToNumber, parseToString } from "@/shared/lib/helper";
import { LazyCommentSection } from "@/features/comment";
import { CommentType } from "@/services/comments";

const NoteDetailPage = () => {
  const searchParams = useSearchParams();
  const projectId = parseToString(searchParams?.get('id'));
  const noteId = parseToNumber(searchParams?.get('noteId'));

  const { data: note } = useProjectNote({
    projectId,
    noteId,
  });

  if (!projectId || noteId == null) {
    return null;
  }

  return (
    <div className="bg-basic-white rounded-2xl">
      <NoteDetail data={note} commentSection={<LazyCommentSection targetId={noteId} targetType={CommentType.Note} />} />
    </div>
  );
};

NoteDetailPage.getLayout = getAdminProjectLayout;

export default NoteDetailPage;
