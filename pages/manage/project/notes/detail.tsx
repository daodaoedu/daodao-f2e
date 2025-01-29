import NoteDetail from '@/components/Note/Detail';
import getProjectLayout from '@/layout/ProjectLayout';

const NoteDetailPage = () => {
  return (
    <div className="bg-basic-white rounded-2xl">
      <NoteDetail className="" />
    </div>
  );
};

NoteDetailPage.getLayout = (page: React.ReactElement) =>
  getProjectLayout(page, 'notes');

export default NoteDetailPage;
