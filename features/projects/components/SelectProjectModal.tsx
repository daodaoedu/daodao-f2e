import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { ProjectSchema, useMyProjects } from '@/services/projects';
import { Button } from '@/shared/ui/button';
import ResponsiveModal, { ResponsiveModalSize } from '@/shared/ui/responsive-modal';

interface SelectProjectModalProps {
  isOpen: boolean;
  renderContent: (project: ProjectSchema) => React.ReactNode;
  onClose: () => void;
  onSelect: (id: string | undefined) => void;
  onRemovedDOM: () => void;
}

export default function SelectProjectModal({
  isOpen,
  renderContent,
  onClose,
  onSelect,
  onRemovedDOM,
}: SelectProjectModalProps) {
  const { data: projects } = useMyProjects();
  const [selectedProject, setSelectedProject] = useState<ProjectSchema | null>(
    null
  );

  const handleSelect = useCallback(
    (project: ProjectSchema | null) => {
      setSelectedProject(project);
      onSelect(project?.id);
    },
    [onSelect]
  );

  const handleCloseModal = useCallback(() => {
    onClose();
    setTimeout(() => {
      setSelectedProject(null);
      onRemovedDOM();
    }, 500);
  }, [onClose, onRemovedDOM]);

  useEffect(() => {
    if (!Array.isArray(projects) || !isOpen) return;

    const { length } = projects;

    if (length === 0) {
      toast.error('請先新增計畫');
      onClose();
    } else if (length === 1 && !selectedProject && projects[0]) {
      handleSelect(projects[0]);
    }
  }, [isOpen, selectedProject, projects, onClose, handleSelect]);

  return (
    <ResponsiveModal
      title={selectedProject ? undefined : '選擇計畫'}
      size={ResponsiveModalSize.Medium}
      open={isOpen}
      onClose={handleCloseModal}
      hasCloseButton
    >
      <div className="mt-4">
        {selectedProject
          ? renderContent(selectedProject)
          : Array.isArray(projects) &&
            projects.map((project, index) => (
              <Button
                key={project.id}
                variant="outline"
                className="body-lg flex w-full items-end justify-between rounded-md text-left"
                onClick={() => handleSelect(project)}
              >
                <div>
                  {index + 1}
                  .
                  {project.title}
                </div>
                <time className="body-sm text-basic-300">
                  {project.createdDate ? format(new Date(project.createdDate), 'yyyy/MM/dd') : ''}
                </time>
              </Button>
            ))}
      </div>
    </ResponsiveModal>
  );
}
