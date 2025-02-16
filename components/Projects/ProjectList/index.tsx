import { Project as ProjectType } from '@/components/Projects/Project/type';
import ProjectCard from '@/components/Projects/ProjectList/ProjectCard';

interface ProjectListProps {
  projects: ProjectType[];
}

const ProjectList = ({ projects }: ProjectListProps) => {
  return (
    projects.map((project) => {
      return (
        <ProjectCard project={project} key={project.id} />
      );
    })
  );
};

export default ProjectList;
