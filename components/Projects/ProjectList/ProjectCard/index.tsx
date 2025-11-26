import { CustomLink } from '@/shared/ui/custom-link';
import { Project as ProjectType } from '@/components/Projects/Project/type';
import { cn } from '@/shared/lib/cn';
import ProjectUserInfoBar from './ProjectUserInfoBar';
import ProjectHeader from './ProjectHeader';

interface ProjectCardProps {
  project: ProjectType;
  path: string;
}

const ProjectCard = ({ project, path }: ProjectCardProps) => {
  const pathroute = path === '/admin' ? '/admin/projects/detail' : '/projects/detail';

  return (
    <CustomLink
      href={`${pathroute}?id=${project.id}`}
      className={cn(
        'p-4 md:py-8 md:px-10 flex flex-col gap-5 justify-start items-start',
        'border-[#EDF0F7] border-solid border-b-[1px]'
      )}
      data-projectid={project.id}
    >
      <div className="flex w-full flex-col items-start justify-start gap-1 md:flex-row md:items-center md:justify-between">
        <ProjectHeader project={project} />
      </div>
      <div>
        <p
          className="
      whitespace-pre-wrap
      font-sans text-base leading-[1.4] text-basic-300"
        >
          {project.description}
        </p>
      </div>
      <div className="align-center flex w-full flex-col justify-between gap-2 md:flex-row">
        <ProjectUserInfoBar user={project.user} />
        {/* <ProjectStatus
          status={{
            favorites: 5,
            shells: 5,
            comments: 3
          }}
        /> */}
      </div>
    </CustomLink>
  );
};
export default ProjectCard;
