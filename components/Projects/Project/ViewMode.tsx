import { Project } from '@/components/Projects/Project/projectType';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import LockIcon from '@mui/icons-material/Lock';
import Button from '@/shared/components/Button';
import {
  Panel,
  Title,
  Tags,
  Description,
  Divider,
  FakeInput,
} from '@/components/Projects/Project/Shared';

interface ViewModeProps {
  project: Partial<Project>;
  isLgScreen: boolean;
  onClick: () => void;
}

const ViewMode = ({ project, isLgScreen, onClick }: ViewModeProps) => {
  const handleOnClickEdit = onClick;
  return (
    <div className="flex flex-col gap-6 md:gap-4 md:relative">

      {
        isLgScreen &&
        (
          <div className="absolute right-0 -top-[60px]">
            <Button
              prefixIcon="MdOutlineEdit"
              className="py-[5px]"
              variant="outline"
              onClick={handleOnClickEdit}
            >
              編輯
            </Button>
          </div>
        )
      }

      <Panel className=" bg-white">
        <Title title="計畫簡述" />
        <Description description={project?.description || ""} />
        <Divider />
        <Title title="學習動機" />
        {
          project?.motivation?.length && (
            <Tags tags={project?.motivation} />
          )
        }
        <Description description={project?.motivationDescription || ""} />
        <Divider />
        <Title title="學習目標" />
        <Description description={project?.goal || ""} />
        <Divider />
        <Title title="學習內容" />
        <Description description={project?.content || ""} />
        <Divider />
        <Title title="學習方法與策略" />
        {
          project?.strategy?.length && (
            <Tags tags={project?.strategy} />
          )
        }
        <Description description={project?.strategyDescription || ""} />
        <Divider />
        <Title title="學習資源" />
        <FakeInput value={project?.resources || ""} />
      </Panel>

      <Panel className="bg-white">
        <h3 className="body-md font-medium mb-5">學習成果及呈現方式 *</h3>
        {
          (project?.outcome?.length) && (
            <Tags tags={project?.outcome} />
          )
        }
        <Description description={project?.outcomeDescription || ""} />
        <Divider />
        <p className="bg-basic-100 py-1 px-[10px] rounded-[4px] inline-block text-basic-500 body-sm">{project?.isPublic ? '公開' : '不公開'}</p>
      </Panel>

      {
        !isLgScreen && (
          <Button
            prefixIcon="MdOutlineEdit"
            variant="outline"
            className="py-[5px]"
            onClick={handleOnClickEdit}
          >
            編輯
          </Button>
        )
      }
    </div>
  );
};

export default ViewMode;
