import { Project as ProjectType } from '@/components/Projects/Project/type';
import dayjs from "dayjs";
import Dropdown from '@/shared/components/Dropdown';
import { Button } from '@/components/ui/button';
import { MdMoreVert } from 'react-icons/md';

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
          {dayjs(project.updatedAt).format('YYYY/MM/DD')}
        </span>

        {/* <span className="flex flex-row items-center justify-start gap-1
          font-sans text-basic-300 text-base leading-normal"
        >
          <ViewIcon />
          9999
        </span> */}
        <Dropdown>
          <Dropdown.Toggle variant="ghost" size="icon" className="flex flex-row items-center justify-center bg-white text-basic-300 hover:bg-basic-100 hover:text-basic-300 hover:shadow-none p-0 w-6 h-6 text-base">
            <MdMoreVert />
          </Dropdown.Toggle>
          <Dropdown.List className="z-20 p-0">
            <Dropdown.Item className="rounded-lg text-nowrap">
              <Button
                variant="ghost"
                onClick={() => window.open('https://forms.gle/NkVbDWC3eXk4P4gv7', '_blank', 'noopener')}
                className="w-full text-left p-2 text-basic-500 hover:bg-basic-100 transition"
              >
                檢舉
              </Button>
            </Dropdown.Item>
          </Dropdown.List>
        </Dropdown>
      </div>
    </>
  );
};

export default ProjectHeader;
