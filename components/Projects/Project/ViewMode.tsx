import { Project } from '@/components/Projects/Project/type';
import { Button } from '@/shared/ui/button';
import { Pencil } from 'lucide-react';
import {
  Panel,
  Title,
  Tags,
  Description,
  Divider,
  FakeInput,
  FakeCheckBox,
} from '@/components/Projects/Project/Shared';

interface ViewModeProps {
  project: Partial<Project>;
  isLgScreen: boolean;
  onClick: () => void;
}

const ViewMode = ({ project, isLgScreen, onClick }: ViewModeProps) => {
  const handleOnClickEdit = onClick;
  return (
    <div className="flex max-w-full flex-col gap-6 md:relative md:gap-4">

      {
        isLgScreen &&
        (
          <div className="absolute -top-[60px] right-0">
            <Button
              variant="outline"
              className="py-[5px]"
              onClick={handleOnClickEdit}
            >
              <Pencil />
              編輯
            </Button>
          </div>
        )
      }

      <Panel className=" bg-white">
        <Title title="計畫簡述" />
        <Description description={project?.description || ''} />
        <Divider />
        <Title title="學習動機" />
        {
          Array.isArray(project?.motivation) && project?.motivation?.length > 0 && (
            <Tags category="motivation_tags" tags={project?.motivation} />
          )
        }
        <Description description={project?.motivationDescription || ''} />
        <Divider />
        <Title title="學習目標" />
        <Description description={project?.goal || ''} />
        <Divider />
        <Title title="學習內容" />
        <Description description={project?.content || ''} />
        <Divider />
        <Title title="學習方法與策略" />
        {
          Array.isArray(project?.strategy) && project?.strategy?.length > 0 && (
            <Tags category="strategy_tags" tags={project?.strategy} />
          )
        }
        <Description description={project?.strategyDescription || ''} />
        {
          project?.resourceName && (
            <>
              <Divider />
              <Title title="學習資源" />
              <div className="flex flex-col gap-2">
                <FakeInput value={project.resourceName || ''} />
              </div>
            </>
          )
        }
      </Panel>

      <Panel className="bg-white">
        <h3 className="body-md mb-5 font-medium">學習成果及呈現方式 *</h3>
        {
          Array.isArray(project?.outcome) && project?.outcome?.length > 0 && (
            <Tags category="outcome_tags" tags={project?.outcome} />
          )
        }
        <Description description={project?.outcomeDescription || ''} />
        <Divider />
        <FakeCheckBox
          isChecked={project?.isPublic}
          text="是否公開給所有人看到"
        />
      </Panel>

      {
        !isLgScreen && (
          <Button
            variant="outline"
            className="mx-auto w-full max-w-[272px] justify-center py-[5px]"
            onClick={handleOnClickEdit}
          >
            <Pencil />
            編輯
          </Button>
        )
      }
    </div>
  );
};

export default ViewMode;
