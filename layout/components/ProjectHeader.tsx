import { useMemo } from 'react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { LockKeyholeOpen, LockKeyhole, EllipsisVertical } from 'lucide-react';
import { ROLE } from '@/constants/member';
import { ProjectSchema } from '@/services/projects';
import { Button } from '@/components/ui/button';

interface ProjectHeaderProps {
  project: ProjectSchema;
}

export default function ProjectHeader({ project }: ProjectHeaderProps) {
  const roleDisplayName = ROLE.find(
    (r) => r.value === project.user.roleList[0]
  )?.label;

  const eventDisplayName = useMemo(() => {
    switch (project.eventId) {
      case '2025S1':
        return '2025春季盃學習馬拉松';
      default:
        return '學習計畫';
    }
  }, [project.eventId]);

  return (
    <header className="mb-6">
      <div className="mb-3 flex flex-col justify-between gap-y-3 lg:flex-row lg:items-center">
        <h1 className="heading-md text-basic-500">
          {project?.title || '學習計畫主題名稱'}
        </h1>
        <div className="flex items-center justify-between gap-2 text-basic-300 lg:justify-end">
          <time>{project?.updatedDate ? format(new Date(project.updatedDate), 'yyyy/MM/dd') : ''}</time>
          <div className="flex items-center gap-2">
            {/* <div className="flex items-center gap-0.5">
          <AiOutlineEye />
          <span>9999</span>
        </div> */}
            <div className="flex items-center gap-0.5">
              {project?.isPublic ? <LockKeyholeOpen /> : <LockKeyhole />}
              <span>{project?.isPublic ? '公開' : '不公開'}</span>
            </div>
            {/* <div className="flex items-center gap-0.5">
          <GoBookmark />
          <span>2</span>
        </div> */}
            <Button
              size="icon"
              variant="ghost"
              onClick={() => toast.error('功能尚未開放')}
            >
              <EllipsisVertical />
            </Button>
          </div>
        </div>
      </div>
      <div className="body-sm flex items-center gap-2">
        <div className="overflow-hidden rounded-full *:!block">
          <img
            src={project?.user?.photoURL}
            alt={project?.user?.name}
            width="40px"
            height="40px"
          />
        </div>
        <div className="text-basic-400">{project?.user?.name}</div>
        <div className="rounded bg-basic-100 px-2.5 py-0.5 text-basic-500">
          {roleDisplayName}
        </div>
        <div className="rounded bg-primary-lighter px-2.5 py-0.5 text-basic-white">
          {eventDisplayName}
        </div>
      </div>
    </header>
  );
}
