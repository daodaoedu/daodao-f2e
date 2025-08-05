import { Project as ProjectType } from '@/components/Projects/Project/type';
import dayjs from "dayjs";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { EllipsisVertical } from 'lucide-react';

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
        <DropdownMenu>
          <DropdownMenuTrigger className="flex flex-row items-center justify-center bg-white text-basic-300 hover:bg-basic-100 hover:text-basic-300 hover:shadow-none p-0 w-6 h-6 text-base">
            <EllipsisVertical />
          </DropdownMenuTrigger>
          <DropdownMenuContent className="z-20 p-0">
            <DropdownMenuItem className="rounded-lg text-nowrap">
              <Button
                variant="ghost"
                onClick={() => window.open('https://forms.gle/NkVbDWC3eXk4P4gv7', '_blank', 'noopener')}
                className="w-full text-left p-2 text-basic-500 hover:bg-basic-100 transition"
              >
                檢舉
              </Button>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </>
  );
};

export default ProjectHeader;
