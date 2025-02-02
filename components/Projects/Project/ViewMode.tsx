import { Project } from '@/components/Projects/Project/projectType';
import { IUser } from '@/services/users';
import dayjs from "dayjs";
import LockOpenIcon from '@mui/icons-material/LockOpen';
import LockIcon from '@mui/icons-material/Lock';

import { ROLE } from '@/constants/member';
import {
  Panel,
  Title,
  Tags,
  Description,
  Divider,
  FakeInput,
  EditFormButton
} from '@/components/Projects/Project/Shared';

const Visibility = ({ isPublic }: {
  isPublic: boolean | undefined
}) => {
  const text = isPublic ? "公開" : "不公開";
  const icon = isPublic ?
    <LockOpenIcon className="max-w-4" />
    :
    <LockIcon className="max-w-4" />;

  return (
    <div className="text-basic-300 text-sm font-sans flex items-center gap-[2px]">
      {icon}
      <span>{text}</span>
    </div>
  );
};

interface ViewModeProps {
  project: Partial<Project>;
  isLgScreen: boolean;
  onClick: () => void;
}

const ViewMode = ({ project, isLgScreen, onClick }: ViewModeProps) => {
  const handleOnClickEdit = onClick;
  return (
    <div className="flex flex-col gap-6 md:gap-4">
      <Panel>
        <div>
          {
            isLgScreen &&
            <EditFormButton onClick={handleOnClickEdit} />
          }
        </div>
      </Panel>

      <Panel className=" bg-white">
        <Title title="計畫簡述" />
        <Description description={project?.description || ""} />
        <Divider />
        <Title title="學習動機" />
        {
          project?.motivation?.tags.length && (
            <Tags tags={project?.motivation.tags} />
          )
        }
        <Description description={project?.motivation?.description || ""} />
        <Divider />
        <Title title="學習目標" />
        <Description description={project?.goals || ""} />
        <Divider />
        <Title title="學習內容" />
        <Description description={project?.content || ""} />
        <Divider />
        <Title title="學習方法與策略" />
        {
          project?.strategies?.tags?.length && (
            <Tags tags={project?.strategies?.tags} />
          )
        }
        <Description description={project?.strategies?.description || ""} />
        <Divider />
        <Title title="學習資源" />
        <FakeInput value={project?.resources || ""} />
      </Panel>

      <Panel className="bg-white">
        <h3 className="body-md font-medium mb-5">學習成果及呈現方式 *</h3>
        {
          (project?.outcomes?.tags?.length) && (
            <Tags tags={project?.outcomes?.tags} />
          )
        }
        <Description description={project?.outcomes?.description || ""} />
        <Divider />
        <p className="bg-basic-100 py-1 px-[10px] rounded-[4px] inline-block text-basic-500 body-sm">{project?.isPublic ? '公開' : '不公開'}</p>
      </Panel>

      {
        !isLgScreen &&
        <EditFormButton onClick={handleOnClickEdit} />
      }
    </div>
  );
};

export default ViewMode;
