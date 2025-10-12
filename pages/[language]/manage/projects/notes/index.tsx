import toast from "react-hot-toast";
import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { parseToString } from "@/utils/helper";
import SEOConfig from "@/components/SEOConfig";
import {
  ContentCard,
  NoteCreateModal,
  NoteDeleteModal,
  NoteUpdateModal,
} from "@/features/projects";
import { getManageProjectLayout } from "@/layout/features/getProjectLayout";
import { Button } from "@/shared/ui/button";
import {
  useProject,
  useProjectNote,
  useProjectNotes,
} from "@/services/projects";

enum ModalTypeEnum {
  Create,
  Update,
  Delete,
}

const NotesPage = () => {
  const searchParams = useSearchParams();
  const projectId = parseToString(searchParams?.get('id'));
  const [modalType, setModalType] = useState<ModalTypeEnum | null>(null);
  const [noteId, setNoteId] = useState<number | null>(null);
  const { data: project } = useProject(projectId);

  const { data: notes } = useProjectNotes(projectId);

  const { data: detail } = useProjectNote({
    projectId,
    noteId,
  });

  const SEOData = useMemo(
    () => ({
      title: `${project?.title} 便利貼｜島島阿學`,
      description:
        project?.description?.substring(0, 150) ||
        "「島島阿學」盼能透過建立多元的學習資源網絡，讓自主學習者能找到合適的成長方法，進一步成為自己想成為的人，從中培養共好精神。目前正積極打造「可共編的學習資源平台」。",
      keywords: "島島阿學",
      author: "島島阿學",
      copyright: "島島阿學",
      imgLink: "https://www.daoedu.tw/assets/brand/horizontal-primary-logo.svg",
      link: `${process.env.PROD_URL}/manage/projects/notes?id=${projectId}`,
    }),
    [project?.title, project?.description, projectId]
  );

  if (!projectId) {
    return <div>專案不存在</div>;
  }

  return (
    <>
      <SEOConfig {...SEOData} />
      <div className="mb-6 flex items-center justify-between body-md">
        <div className="text-basic-500">便利貼 ({notes?.length ?? 0})</div>
        <Button
          variant="default"
          onClick={() => setModalType(ModalTypeEnum.Create)}
        >
          新增便利貼
        </Button>
      </div>
      <ul className="px-4 bg-basic-white flex flex-col rounded-2xl">
        {notes?.map((note) => (
          <li
            key={note.id}
            className="py-6 border-b last:border-b-0 border-solid border-basic-200"
          >
            <ContentCard
              type="note"
              data={note}
              className="p-3 transition-shadow hover:shadow-basic-200/40 hover:shadow-lg"
              detailLink={`/manage/projects/notes/detail?id=${projectId}&noteId=${note.id}`}
              onEditClick={() => {
                setModalType(ModalTypeEnum.Update);
                setNoteId(note.id);
              }}
              onDeleteClick={() => {
                setModalType(ModalTypeEnum.Delete);
                setNoteId(note.id);
              }}
            />
          </li>
        ))}
      </ul>

      {project && (
        <NoteCreateModal
          isOpen={modalType === ModalTypeEnum.Create}
          onClose={() => setModalType(null)}
          projectId={projectId}
          projectTitle={project.title}
          onSuccess={() => {
            toast.success("新增成功");
            setModalType(null);
          }}
        />
      )}

      {detail && noteId && project && (
        <NoteUpdateModal
          key={noteId}
          isOpen={modalType === ModalTypeEnum.Update}
          onClose={() => setModalType(null)}
          projectId={projectId}
          projectTitle={project.title}
          noteId={noteId}
          onSuccess={() => {
            toast.success("更新成功");
            setModalType(null);
            setNoteId(null);
          }}
        />
      )}

      {noteId && (
        <NoteDeleteModal
          isOpen={modalType === ModalTypeEnum.Delete}
          projectId={projectId}
          noteId={noteId}
          onClose={() => setModalType(null)}
          onSuccess={() => {
            toast.success("刪除成功");
            setModalType(null);
            setNoteId(null);
          }}
        />
      )}
    </>
  );
};

NotesPage.getLayout = getManageProjectLayout;

export default NotesPage;
