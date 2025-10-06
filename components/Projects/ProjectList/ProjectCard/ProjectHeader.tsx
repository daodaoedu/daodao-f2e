import { Project as ProjectType } from '@/components/Projects/Project/type';
import { format } from 'date-fns';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu';
import { Button } from '@/shared/ui/button';
import { EllipsisVertical } from 'lucide-react';

interface ProjectHeaderProps {
  project: ProjectType;
}

const ProjectHeader = ({ project }: ProjectHeaderProps) => (
  <>
    <h3 className="font-sans text-lg font-bold leading-normal text-basic-500">
      {project.title}
    </h3>
    <div className="ml-auto flex flex-row items-center justify-start gap-2">
      <span className="font-sans text-sm leading-normal text-basic-300">
        {format(new Date(project.updatedAt), 'yyyy/MM/dd')}
      </span>

      {/* <span className="flex flex-row items-center justify-start gap-1
          font-sans text-basic-300 text-base leading-normal"
        >
          <ViewIcon />
          9999
        </span> */}
      <DropdownMenu>
        <DropdownMenuTrigger className="flex size-6 flex-row items-center justify-center bg-white p-0 text-base text-basic-300 hover:bg-basic-100 hover:text-basic-300 hover:shadow-none">
          <EllipsisVertical />
        </DropdownMenuTrigger>
        <DropdownMenuContent className="z-20 p-0">
          <DropdownMenuItem className="text-nowrap rounded-lg">
            <Button
              variant="ghost"
              onClick={() => window.open('https://forms.gle/NkVbDWC3eXk4P4gv7', '_blank', 'noopener')}
              className="w-full p-2 text-left text-basic-500 transition hover:bg-basic-100"
            >
              檢舉
            </Button>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  </>
);

export default ProjectHeader;
