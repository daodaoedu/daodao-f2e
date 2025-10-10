'use client';

import z from 'zod';
import { Suspense } from 'react';
import { useProject } from '@/services/projects/core/hooks';
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
} from '@/components/Projects/Project/Shared';
import { parseToString } from '@/utils/helper';

function ProjectDetailPageContent() {
  const searchParams = useSearchParams();
  const projectId = parseToString(searchParams?.get('id'));

  // Validate project ID
  const isValidId = z.string().uuid().safeParse(projectId).success;

  if (!isValidId && projectId) {
    toast.error('找不到這個計劃');
    return null;
  }

  const { data: project, isLoading, error } = useProject(projectId);

  if (error) {
    toast.error('系統錯誤，請稍後再試');
  }

  return (
    <>
      <div className="w-[750px] max-w-full mx-auto">
        {isLoading ? (
          <Skeleton />
        ) : (
          <>
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
              <Title title="學習方式" />
              {Array.isArray(project?.strategy) && project?.strategy?.length > 0 && (
                <Tags category="strategy_tags" tags={project?.strategy} />
              )}
              <Description description={project?.strategyDescription || ''} />
              <Divider />
              <Title title="相關網址" />
              {Array.isArray(project?.resourceUrl) && project?.resourceUrl?.length > 0 && (
                project?.resourceUrl?.map((url: string) => (
                  <FakeInput
                    key={url}
                    value={url}
                  />
                ))
              )}
              <Divider />
            </Panel>
          </>
        )}
      </div>
    </>
  );
}

export default function ProjectDetailPage() {
  return (
    <Suspense fallback={<Skeleton />}>
      <ProjectDetailPageContent />
    </Suspense>
  );
}
