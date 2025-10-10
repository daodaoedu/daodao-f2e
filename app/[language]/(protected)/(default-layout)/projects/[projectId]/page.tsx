'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Project as ProjectType } from '@/components/Projects/Project/type';
import { projectAPIClass } from '@/services/projects/core/api';
import toast from 'react-hot-toast';
import { Skeleton } from '@/shared/ui/skeleton';
import { Button } from '@/shared/ui/button';
import { ArrowLeft } from 'lucide-react';
import {
  Panel,
  Title,
  Tags,
  Description,
  Divider,
  FakeInput,
  FakeCheckBox,
} from '@/components/Projects/Project/Shared';

export default function ProjectDetailPage() {
  const router = useRouter();
  const params = useParams();
  const projectId = params?.projectId as string;

  const [isFetchingProject, setIsFetchingProject] = useState(false);
  const [project, setProject] = useState<ProjectType>();
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchProject = async (id: string) => {
      try {
        setIsFetchingProject(true);
        setError(false);
        const responseData = await projectAPIClass.read(id);

        if (responseData && responseData.id) {
          setProject(responseData as unknown as ProjectType);
        }
      } catch (err) {
        console.error(err);
        setError(true);
        toast.error('系統錯誤，請稍後再試');
      } finally {
        setIsFetchingProject(false);
      }
    };

    if (projectId) {
      fetchProject(projectId);
    }
  }, [projectId]);

  if (!projectId) {
    return null;
  }

  if (isFetchingProject) {
    return (
      <div className="min-h-screen bg-primary-palest flex items-center justify-center">
        <Skeleton />
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-primary-palest flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-md p-6 w-full max-w-3xl text-center">
          <h1 className="text-xl font-bold mb-4">找不到這個計劃</h1>
          <p className="text-base text-muted-foreground mb-4">該計劃可能已被刪除或不存在</p>
          <Button onClick={() => router.back()} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            返回上一頁
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-[750px] max-w-full mx-auto">
      <Panel className=" bg-white mb-8 md:mb-6">
        <Title title="計畫簡述" />
        <Description description={project?.description || ''} />
        <Divider />
        <Title title="學習動機" />
        {Array.isArray(project?.motivation) &&
          project?.motivation?.length > 0 && (
            <Tags category="motivation_tags" tags={project?.motivation} />
          )}
        <Description description={project?.motivationDescription || ''} />
        <Divider />
        <Title title="學習目標" />
        <Description description={project?.goal || ''} />
        <Divider />
        <Title title="學習內容" />
        <Description description={project?.content || ''} />
        <Divider />
        <Title title="學習方法與策略" />
        {Array.isArray(project?.strategy) &&
          project?.strategy?.length > 0 && (
            <Tags category="strategy_tags" tags={project?.strategy} />
          )}
        <Description description={project?.strategyDescription || ''} />
        {project?.resourceName && (
          <>
            <Divider />
            <Title title="學習資源" />
            <div className="flex flex-col gap-2">
              <FakeInput value={project?.resourceName} />
            </div>
          </>
        )}
      </Panel>

      <Panel className="bg-white">
        <h3 className="body-md font-medium mb-5 text-basic-500">學習成果及呈現方式 *</h3>
        {Array.isArray(project?.outcome) &&
          project?.outcome?.length > 0 && (
            <Tags category="outcome_tags" tags={project?.outcome} />
          )}
        <Description description={project?.outcomeDescription || ''} />
        <Divider />
        <FakeCheckBox
          isChecked={project?.isPublic}
          text="是否公開給所有人看到"
        />
      </Panel>
    </div>
  );
}
