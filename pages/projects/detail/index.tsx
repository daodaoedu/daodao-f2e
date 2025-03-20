import { useState, useEffect } from 'react';
import getPublicProjectLayout from '@/layout/PublicProjectLayout';
import { Project as ProjectType } from '@/components/Projects/Project/type';
import { BASE_URL } from '@/constants/common';
import { useSearchParams } from 'next/navigation';
import toast from 'react-hot-toast';
import { Skeleton } from '@mui/material';
import {
  Panel,
  Title,
  Tags,
  Description,
  Divider,
  FakeInput,
  FakeCheckBox,
} from '@/components/Projects/Project/Shared';
import z from 'zod';

interface ProjectDetailPageProps {
  projectId?: string;
  inExplore?: boolean;
}

const ProjectDetailPage = ({ projectId: propProjectId, inExplore = false }: ProjectDetailPageProps) => {
  const [isFetchingProject, setIsFetchingProject] = useState(false);
  const [project, setProject] = useState<ProjectType>();
  const searchParams = useSearchParams();
  const queryProjectId = searchParams.get('id') ?? undefined;
  const finalProjectId = propProjectId || queryProjectId;

  useEffect(() => {
    const fetchProject = async () => {
      try {
        setIsFetchingProject(true);
        const response = await fetch(`${BASE_URL}/projects/${finalProjectId}`);
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

    if (finalProjectId) {
      if (z.string().uuid().safeParse(finalProjectId).success) {
        fetchProject();
      } else {
        toast.error('找不到這個計劃');
      }
    }
  }, [finalProjectId]);

  // 如果在 explore 頁面中，則簡化渲染內容
  if (inExplore) {
    return (
      <div className="w-full mx-auto">
        {isFetchingProject ? (
          <Skeleton />
        ) : (
          <>
            <Panel className="bg-white mb-8 md:mb-6">
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
          </>
        )}
      </div>
    );
  }

  // 原有的完整渲染邏輯
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
// 僅在非嵌入模式下使用專用佈局
ProjectDetailPage.getLayout = (page) => {
  const { inExplore } = page.props;
  return inExplore ? page : getPublicProjectLayout(page);
};
export default ProjectDetailPage;
