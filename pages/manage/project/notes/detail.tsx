import NoteDetail from '@/components/Note/Detail';
import ProjectLayout from '@/layout/ProjectLayout';

const NoteDetailPage = () => {
  return (
    <div className="bg-basic-white rounded-2xl">
      <NoteDetail className="" />
    </div>
  );
};

NoteDetailPage.getLayout = ({ children }: React.PropsWithChildren) => (
  <ProjectLayout activeTabType="notes">{children}</ProjectLayout>
);

export default NoteDetailPage;
