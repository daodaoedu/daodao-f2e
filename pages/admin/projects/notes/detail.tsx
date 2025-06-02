import { useRouter } from "next/router";
import { NoteDetail } from "@/features/projects";
import { getAdminProjectLayout } from "@/layout/features/getProjectLayout";
import { useProjectNote } from "@/services/modules/projects";
import { parseToNumber, parseToString } from "@/services/core";

const NoteDetailPage = () => {
  const router = useRouter();
  const { query } = router;
  const projectId = parseToString(query.id);
  const noteId = parseToNumber(query.noteId);

  const { data: note } = useProjectNote({
    projectId,
    noteId,
  });

  if (!projectId || noteId == null) {
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
