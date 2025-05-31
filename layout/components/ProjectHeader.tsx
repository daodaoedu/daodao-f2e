import { useMemo } from 'react';
import toast from 'react-hot-toast';
import dayjs from 'dayjs';
import { MdLockOpen, MdLock } from 'react-icons/md';
import { AiOutlineMore } from 'react-icons/ai';
import { ROLE } from '@/constants/member';
import { ProjectSchema } from '@/services/modules/projects';
import { Button } from '@/components/atoms/button';

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
      <div className="mb-3 flex flex-col lg:flex-row justify-between lg:items-center gap-y-3">
        <h1 className="heading-md text-basic-500">
          {project?.title || '學習計畫主題名稱'}
        </h1>
        <div className="flex items-center justify-between lg:justify-end gap-2 text-basic-300">
          <time>{dayjs(project?.updatedDate).format('YYYY/MM/DD')}</time>
          <div className="flex items-center gap-2">
            {/* <div className="flex items-center gap-0.5">
          <AiOutlineEye />
          <span>9999</span>
        </div> */}
            <div className="flex items-center gap-0.5">
              {project?.isPublic ? <MdLockOpen /> : <MdLock />}
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
              <AiOutlineMore />
            </Button>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2 body-sm">
        <div className="rounded-full overflow-hidden *:!block">
          <img
            src={project?.user?.photoURL}
            alt={project?.user?.name}
            width="40px"
            height="40px"
          />
        </div>
        <div className="text-basic-400">{project?.user?.name}</div>
        <div className="px-2.5 py-0.5 text-basic-500 bg-basic-100 rounded">
          {roleDisplayName}
        </div>
        <div className="px-2.5 py-0.5 text-basic-white bg-primary-lighter rounded">
          {eventDisplayName}
        </div>
      </div>
    </header>
  );
}
