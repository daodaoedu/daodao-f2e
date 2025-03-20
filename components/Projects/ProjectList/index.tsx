import { Project as ProjectType } from '@/components/Projects/Project/type';
import ProjectCard from '@/components/Projects/ProjectList/ProjectCard';

interface ProjectListProps {
  projects: ProjectType[];
  path: string;
  onProjectClick?: (projectId: string) => void;
}

const ProjectList = ({ projects, path, onProjectClick }: ProjectListProps) => {
  return (
    projects.map((project) => {
      return (
        <ProjectCard
          project={project}
          key={project.id}
          path={path}
          onProjectClick={onProjectClick}
        />
      );
    })
  );
};

export default ProjectList;
