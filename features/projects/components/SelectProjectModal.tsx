import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import dayjs from 'dayjs';
import { ProjectSchema, useMyProjects } from '@/services/modules/projects';
import Button from '@/shared/components/Button';
import Modal from '@/shared/components/Modal';

interface SelectProjectModalProps {
  isOpen: boolean;
  renderContent: (project: ProjectSchema) => React.ReactNode;
  onClose: () => void;
  onSelect: (id: string | undefined) => void;
}

export default function SelectProjectModal({
  isOpen,
  renderContent,
  onClose,
  onSelect,
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

  useEffect(() => {
    if (!Array.isArray(projects) || !isOpen) return;

    const { length } = projects;

    if (length === 0) {
      toast.error('請先新增計畫');
      onClose();
    } else if (length === 1 && !selectedProject) {
      handleSelect(projects[0]);
    }
  }, [isOpen, selectedProject, projects, onClose, handleSelect]);

  return (
    <Modal
      title={selectedProject ? undefined : '選擇計畫'}
      size="md"
      isOpen={isOpen}
      onClose={onClose}
      className="lg:p-4"
      hasCloseButton
      onRemovedDOM={() => handleSelect(null)}
    >
      <div className="mt-4">
        {selectedProject
          ? renderContent(selectedProject)
          : Array.isArray(projects) &&
            projects.map((project, index) => (
              <Button
                key={project.id}
                variant="outline"
                className="w-full rounded-md text-left body-lg flex justify-between items-end"
                onClick={() => handleSelect(project)}
              >
                <div>
                  {index + 1}. {project.title}
                </div>
                <time className="body-sm text-basic-300">
                  {dayjs(project.createdDate).format('YYYY/MM/DD')}
                </time>
              </Button>
            ))}
      </div>
    </Modal>
  );
}
