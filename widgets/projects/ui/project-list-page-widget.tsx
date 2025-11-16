'use client';

import { useState } from 'react';
import { Skeleton } from '@/shared/ui/skeleton';
import { cn } from '@/shared/lib/cn';
import ProjectList from '@/components/Projects/ProjectList';
import EmptyList from '@/components/Projects/ProjectList/EmptyList';
import type { ProjectListResponse } from '@/entities/project';

const tabList = [
  {
    id: 'project_shared',
    label: '學習計畫分享區',
    isDisabled: false,
  },
  {
    id: 'project_notes',
    label: '便利貼',
    isDisabled: true,
  },
];

interface ProjectListPageWidgetProps {
  data?: ProjectListResponse;
  isLoading?: boolean;
}

const Tabs = () => {
  const [active, setActive] = useState('project_shared');

  return (
    <div className="tabs flex w-full flex-row items-stretch justify-start border-b-[1px] border-solid border-[#EDF0f7]">
      {tabList.map((tab) => {
        return (
          <div key={tab.id} className="w-1/2">
            <button
              type="button"
              name={tab.id}
              className={cn(
                'w-full bg-white px-3 pt-3 font-sans text-base leading-normal',
                tab.id === active
                  ? 'border-b-4 border-solid border-primary-lightest pb-[6px] font-bold text-primary-base'
                  : 'pb-[10px] font-normal text-basic-400',
                tab.isDisabled
                  ? 'hover:cursor-not-allowed'
                  : 'hover:cursor-pointer'
              )}
              disabled={tab.isDisabled}
              onClick={() => setActive(tab.id)}
            >
              {tab.label}
            </button>
          </div>
        );
      })}
    </div>
  );
};

export const ProjectListPageWidget = ({
  data,
  isLoading = false,
}: ProjectListPageWidgetProps) => {
  const projects = data?.data || [];

  return (
    <div className="bg-primary-pale">
      <div className="mx-auto flex w-[670px] max-w-full flex-col gap-6 px-4 py-8 md:py-28">
        <div>
          <h2 className="heading-md text-basic-500">學習計畫分享區</h2>
        </div>

        <div className="overflow-hidden rounded-[20px] bg-white">
          <Tabs />
          {isLoading && <Skeleton className="mx-auto h-[200px] w-[95%]" />}
          {!isLoading && Array.isArray(projects) && projects.length > 0 ? (
            <ProjectList projects={projects} path="" />
          ) : (
            !isLoading && <EmptyList />
          )}
        </div>
      </div>
    </div>
  );
};
