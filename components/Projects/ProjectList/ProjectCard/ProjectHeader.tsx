import { Project as ProjectType } from '@/components/Projects/Project/type';
import dayjs from "dayjs";
import { AiOutlineEye as ViewIcon } from 'react-icons/ai';
import ReportMenu from '@/shared/components/ReportMenu';

interface ProjectHeaderProps {
  project: ProjectType;
}

const ProjectHeader = ({ project }: ProjectHeaderProps) => {
  return (
    <>
      <h3 className="font-sans font-bold text-basic-500 text-lg leading-normal">
        {project.title}
      </h3>
      <div className="ml-auto flex flex-row justify-start items-center gap-2">
        <span className="font-sans text-basic-300 text-sm leading-normal">
          {dayjs(project.updatedDate).format('YYYY/MM/DD')}
        </span>

        <span className="flex flex-row items-center justify-start gap-1
          font-sans text-basic-300 text-base leading-normal"
        >
          <ViewIcon />
          9999
        </span>
        <ReportMenu />
      </div>
    </>
  );
};

export default ProjectHeader;
