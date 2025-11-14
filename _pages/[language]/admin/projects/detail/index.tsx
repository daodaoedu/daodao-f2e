import z from 'zod';
import { useState, useEffect } from 'react';
import { getAdminProjectLayout } from '@/layout/features/getProjectLayout';
import { Project as ProjectType } from '@/components/Projects/Project/type';
import { BASE_URL } from '@/constants/common';
import { useSearchParams } from 'next/navigation';
import toast from 'react-hot-toast';
import { Skeleton } from '@/shared/ui/skeleton';
import {
  Panel,
  Title,
  Tags,
  Description,
  Divider,
  FakeInput,
  FakeCheckBox,
} from '@/components/Projects/Project/Shared';
import { parseToString } from '@/shared/lib/helper';

const ProjectDetailPage = () => {
  const [isFetchingProject, setIsFetchingProject] = useState(false);
  const [project, setProject] = useState<ProjectType>();
  const searchParams = useSearchParams();
  const projectId = parseToString(searchParams?.get('id'));

  useEffect(() => {
    const fetchProject = async () => {
      try {
        setIsFetchingProject(true);
        const response = await fetch(`${BASE_URL}/projects/${projectId}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const responseData = await response.json();

        if (responseData && responseData.id) {
          setProject(responseData);
        }
      } catch (error) {
        console.error(error);
        toast.error('系統錯誤，請稍後再試');
      } finally {
        setIsFetchingProject(false);
      }
    };

    if (projectId) {
      if (z.string().uuid().safeParse(projectId).success) {
        fetchProject();
      } else {
        toast.error('找不到這個計劃');
      }
    }
  }, [projectId]);

  return (
    <>
      <div className="w-[750px] max-w-full mx-auto">
        {isFetchingProject ?
          <Skeleton />
          :
          (
            <>
              <Panel className=" bg-white mb-8 md:mb-6">
                <Title title="計畫簡述" />
                <Description description={project?.description || ""} />
                <Divider />
                <Title title="學習動機" />
                {
                  Array.isArray(project?.motivation) && project?.motivation?.length > 0 && (
                    <Tags category="motivation_tags" tags={project?.motivation} />
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
                  Array.isArray(project?.strategy) && project?.strategy?.length > 0 && (
                    <Tags category="strategy_tags" tags={project?.strategy} />
                  )
                }
                <Description description={project?.strategyDescription || ""} />
                {
                  project?.resourceName && (
                    <>
                      <Divider />
                      <Title title="學習資源" />
                      <div className="flex flex-col gap-2">
                        <FakeInput
                          value={project?.resourceName}
                        />
                      </div>
                    </>
                  )
                }
              </Panel>

              <Panel className="bg-white">
                <h3 className="body-md font-medium mb-5">學習成果及呈現方式 *</h3>
                {
                  (Array.isArray(project?.outcome) && project?.outcome?.length > 0) && (
                    <Tags category="outcome_tags" tags={project?.outcome} />
                  )
                }
                <Description description={project?.outcomeDescription || ""} />
                <Divider />
                <FakeCheckBox
                  isChecked={project?.isPublic}
                  text="是否公開給所有人看到"
                />
              </Panel>
            </>
          )
        }
      </div>
    </>
  );
};
ProjectDetailPage.getLayout = getAdminProjectLayout;
export default ProjectDetailPage;
