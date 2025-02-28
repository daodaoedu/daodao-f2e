import { Project as ProjectType } from '@/components/Projects/Project/type';
import ProjectCard from '@/components/Projects/ProjectList/ProjectCard';

interface ProjectListProps {
  projects: ProjectType[];
  path: string;
}

const ProjectList = ({ projects, path }: ProjectListProps) => {
  return (
    projects.map((project) => {
      return (
        <ProjectCard project={project} key={project.id} path={path} />
      );
    })
  );
};

export default ProjectList;
