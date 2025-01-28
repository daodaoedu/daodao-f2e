import OutcomeCard from '@/components/Outcome/Card';
import ProjectLayout from '@/layout/ProjectLayout';
import Button from '@/shared/components/Button';

const Project = () => {
  return (
    <>
      <div className="mb-6 flex items-center justify-between body-md">
        <div className="text-basic-500">學習成果 (2)</div>
        <Button variant="solid" color="primary">
          新增成果
        </Button>
      </div>
      <ul className="px-4 bg-basic-white flex flex-col rounded-2xl">
        <li className="py-6 border-b last:border-b-0 border-solid border-basic-200">
          <OutcomeCard className="p-3 transition-shadow hover:shadow-basic-200/40 hover:shadow-lg" />
        </li>
        <li className="py-6 border-b last:border-b-0 border-solid border-basic-200">
          <OutcomeCard className="p-3 transition-shadow hover:shadow-basic-200/40 hover:shadow-lg" />
        </li>
      </ul>
    </>
  );
};

Project.getLayout = ProjectLayout;

export default Project;
