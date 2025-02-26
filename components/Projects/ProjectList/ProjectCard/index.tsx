import Link from 'next/link';
import { Project as ProjectType } from '@/components/Projects/Project/type';
import { cn } from '@/utils/cn';
import ProjectUserInfoBar from './ProjectUserInfoBar';
import ProjectHeader from './ProjectHeader';

interface ProjectCardProps {
  project: ProjectType;
}

const ProjectCard = ({ project }: ProjectCardProps) => {
  return (
    <Link
      href={`/projects/detail?id=${project.id}`}
      className={cn(
        "p-4 md:py-8 md:px-10 flex flex-col gap-5 justify-start items-start",
        "border-[#EDF0F7] border-solid border-b-[1px]"
      )}
      data-projectid={project.id}
    >
      <div className="w-full flex flex-col gap-1 justify-start items-start md:flex-row md:justify-between md:items-center">
        <ProjectHeader project={project} />
      </div>
      <div>
        <p
          className="
      whitespace-pre-wrap
      text-base text-basic-300 font-sans leading-[1.4]"
        >
          {project.description}
        </p>
      </div>
      <div className="w-full flex flex-col gap-2 md:flex-row align-center justify-between">
        <ProjectUserInfoBar user={project.user} />
        {/* <ProjectStatus
          status={{
            favorites: 5,
            shells: 5,
            comments: 3
          }}
        /> */}
      </div>
    </Link>
  );
};
export default ProjectCard;
