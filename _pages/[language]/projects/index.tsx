import { useState, useEffect } from 'react';
import { BASE_URL } from "@/constants/common";
import toast from 'react-hot-toast';
import { Project as ProjectType } from "@/components/Projects/Project/type";
import { Skeleton } from '@/shared/ui/skeleton';
import { cn } from '@/shared/lib/cn';
import ProjectList from '@/components/Projects/ProjectList';
import EmptyList from '@/components/Projects/ProjectList/EmptyList';

const tabList = [
  {
    id: 'project_shared',
    label: '學習計畫分享區',
    isDisabled: false
  },
  {
    id: 'project_notes',
    label: '便利貼',
    isDisabled: true
  }
];

const Tabs = () => {
  const [active, setActive] = useState('project_shared');

  return (
    <div className="tabs w-full flex flex-row justify-start items-stretch border-b-[1px] border-solid border-[#EDF0f7]">
      {
        tabList.map((tab) => {
          return (
            <div key={tab.id} className="w-1/2">
              <button
                type="button"
                name={tab.id}
                className={cn(
                  'w-full font-sans text-base leading-normal px-3 pt-3 bg-white',
                  tab.id === active ?
                    'text-primary-base font-bold pb-[6px] border-primary-lightest border-solid border-b-4'
                    :
                    'text-basic-400 font-normal pb-[10px]',
                  tab.isDisabled ?
                    'hover:cursor-not-allowed'
                    :
                    'hover:cursor-pointer'
                )}
                disabled={tab.isDisabled}
                onClick={() => setActive(tab.id)}
              >
                {tab.label}
              </button>
            </div>
          );
        })
      }
    </div>
  );
};

const PageProjectsEvents = () => {
  const [isFetchingProjects, setIsFetchingProjects] = useState(false);
  const [projects, setProjects] = useState<ProjectType[]>([]);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setIsFetchingProjects(true);
        const response = await fetch(`${BASE_URL}/projects/public`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const responseData = await response.json();
        if (responseData.data && responseData.data.length) {
          const result = responseData.data;
          if (result && result.length) {
            setProjects(result);
          }
        }
      } catch (error) {
        console.error(error);
        toast.error('系統錯誤，請稍後再試');
      } finally {
        setIsFetchingProjects(false);
      }
    };
    fetchProjects();
  }, []);

  return (
    <div className="bg-primary-pale">
      <div className="mx-auto w-[670px] max-w-full flex flex-col gap-6 px-4 py-8 md:py-28">
        <div>
          <h2 className="text-basic-500 heading-md">
            學習計畫分享區
          </h2>
        </div>

        <div className="rounded-[20px] overflow-hidden bg-white">
          <Tabs />
          {
            isFetchingProjects && (
              <Skeleton className="w-[95%] h-[200px] mx-auto" />
            )
          }
          {Array.isArray(projects) && projects.length > 0
            ? <ProjectList projects={projects} path="" />
            : <EmptyList />
          }
        </div>
      </div>
    </div>
  );
};
export default PageProjectsEvents;
