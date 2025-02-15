import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { BASE_URL } from "@/constants/common";
import toast from 'react-hot-toast';
import { Project as ProjectType } from "@/components/Projects/Project/type";
import { Skeleton } from '@mui/material';
import { cn } from '@/utils/cn';
import EmptyImg from '@/public/assets/images/empty.png';
import dayjs from 'dayjs';
import { AiOutlineEye } from 'react-icons/ai';
import { MdMoreVert } from 'react-icons/md';
import ReportMenu from '@/shared/components/ReportMenu';

const Tabs = () => {
  const [active, setActive] = useState('project_shared');
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

interface ProjectListProps {
  projects: ProjectType[];
}

const ProjectList = ({ projects }: ProjectListProps) => {
  return (
    <>
      {
        projects.map((project, index) => {
          return (
            <div
              className={cn(
                "p-4 md:py-8 md:px-10 flex flex-col gap-5 justify-start items-start",
                index === projects.length - 1 ?
                  ''
                  :
                  'border-[#EDF0F7] border-solid border-b-[1px]'
              )}
              key={project.id}
              data-projectId={project.id}
            >
              <div className="w-full flex flex-col gap-1 justify-start items-start md:flex-row md:justify-between md:items-center">
                <h3 className="font-sans font-bold text-basic-500 text-lg leading-normal">{project.title}</h3>
                <div className="
                  ml-auto
                  flex flex-row justify-start items-center gap-2"
                >
                  <span className="
                      font-sans
                    text-basic-300
                      text-sm leading-normal
                    "
                  >
                    {dayjs(project.updatedDate).format('YYYY/MM/DD')}
                  </span>

                  <span className="
                    flex flex-row items-center justify-start gap-1
                    font-sans text-basic-300 text-base leading-normal"
                  >
                    <AiOutlineEye />
                    9999
                  </span>

                  <ReportMenu />
                </div>
              </div>
              <div>
                <p
                  className="
                    whitespace-pre-wrap
                    text-base text-basic-300 font-sans leading-[1.4]"
                >
                  {project.description}
                </p>
              </div>
            </div>
          );
        })
      }
    </>
  );
};
const PageProjectsEvents = () => {
  const [isFetchingProjects, setIsFetchingProjects] = useState(false);
  const [projects, setProjects] = useState<ProjectType[]>([]);
  const router = useRouter();
  const pathname = usePathname();
  const fetchProjects = async () => {
    try {
      setIsFetchingProjects(true);
      const response = await fetch(`${BASE_URL}/projects`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const responseData = await response.json();
      if (responseData.data && responseData.data.length) {
        const result = responseData.data.filter((project: ProjectType) => {
          // TODO: filter project with eventId after api ready
          return project;
        });

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
  useEffect(() => {
    if (router && pathname) {
      fetchProjects();
    }
  }, [router, pathname]);

  return (
    <div className="bg-[#EEF9F9]">
      <div className="mx-auto w-[670px] max-w-full flex flex-col gap-6 px-4 py-8 md:py-28 bg-[#EEF9F9]">
        <div>
          <h2 className="text-basic-500 heading-md">
            學習計畫分享區
          </h2>
        </div>

        <div className="rounded-[20px] overflow-hidden bg-white">
          <Tabs />
          {
            isFetchingProjects && (
              <Skeleton animation="wave" width="95%" height="200px" className="mx-auto" />
            )
          }
          { Array.isArray(projects) && projects.length > 0
            ? <ProjectList projects={projects} />
            :
            (
              <div className="bg-white flex flex-col items-center justify-center p-4 md:p-8">
                <img
                  src={EmptyImg.src}
                  alt="no project"
                  className="w-[150px]"
                />
                <p className="font-sans text-base leading-normal text-basic-500">這裡還沒有東西喔！</p>
              </div>
            )
          }
        </div>
      </div>
    </div>
  );
};
export default PageProjectsEvents;
