import { useRouter } from 'next/router';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import Select from '@/components/Projects/Form/Select';
import AccessDenied from '@/shared/components/AccessDenied';
import GoBackButton
  from '@/components/Projects/GoBackButton';
import { ProtectedComponent } from '@/contexts/Auth';
import emptyCoverImg from '@/public/assets/empty-cover.png';
import CircleIcon from '@mui/icons-material/Circle';
import More from '@/components/Projects/More';
import Button from '@/shared/components/Button';
import { cn } from '@/utils/cn';

const Projects = () => {
  const maxProjects = 3;
  const router = useRouter();
  const projects = [
    {
      id: "1179b1b0-48ac-480f-ae5f-4297d80aad97",
      userId: 2,
      imgUrl: "https://example.com/image.jpg",
      title: "學習 React 和 Node.js 全端開發",
      description: "透過實作專案來學習現代網頁開發技術",
      motivation: [
        "interest_and_passion",
        "career_development",
        "self_challenge"
      ],
      motivationDescription: "希望能夠成為全端工程師，並且製作有意義的專案",
      goal: "完成一個完整的全端專案",
      content: "將學習 React、Node.js、Express、PostgreSQL 等技術，並實作一個社群平台",
      strategy: [
        "watching_videos",
        "doing_projects",
        "joining_communities"
      ],
      strategyDescription: "結合線上課程和實作專案的方式學習",
      resourceName: [
        "Udemy React 課程",
        "Node.js 官方文檔",
        "PostgreSQL 教學"
      ],
      resourceUrl: [
        "https://udemy.com/course/react",
        "https://nodejs.org/docs",
        "https://postgresql.org/docs"
      ],
      outcome: [
        "building_websites",
        "managing_social_media"
      ],
      outcomeDescription: "預期能夠獨立開發和部署全端應用",
      isPublic: true,
      status: "Not Started",
      startDate: "2024-03-20",
      endDate: "2024-06-20",
      interval: 12,
      createdAt: "2025-02-05T15:23:51.132Z",
      updatedAt: "2025-02-05T15:23:51.132Z",
      version: 1,
      user: {
        id: 2,
        name: "小許",
        _id: "ef7a58e5-b39f-4cc1-980b-d77eb0e02648"
      },
      milestones: [
        {
          id: 312,
          week: 1,
          name: "React",
          description: "學習 React 核心概念",
          startDate: "2024-03-20",
          endDate: "2024-03-27",
          isCompleted: false,
          tasks: []
        },
        {
          id: 313,
          week: 2,
          name: "Node.js 基礎",
          description: "學習 Node.js 和 Express",
          startDate: "2024-03-28",
          endDate: "2024-04-04",
          isCompleted: false,
          tasks: []
        }
      ]
    }
  ];
  const isEditPermitted = Boolean(projects.length);
  const isAddedDenied = projects.length >= maxProjects;
  const options = [
    { value: "all", label: "全部計畫" },
    { value: "learning-marathon", label: "學習馬拉松" },
  ];
  const getProjectType = (eventId) => {
    switch (eventId) {
      case "2025S1":
        return "學習馬拉松";
      default:
        return "學習計畫";
    }
  };

  return (
    <ProtectedComponent>
      <div className="bg-[#F3FCFC] md:py-8">
        <div className="w-full p-4 bg-[#F3FCFC]
          md:w-[860px] mx-auto box-border flex flex-col gap-6"
        >
          <GoBackButton
            onClick={() => router.push({
              pathname: '/manage',
              query: {
                id: 'island'
              }
            })}
            icon={
              (
                <KeyboardArrowLeftIcon
                  className="
                  text-basic-400
                  group-hover:text-primary-base"
                />
              )}
            buttonText="返回 我的小島"
          />
          <h2 className="heading-md text-basic-400">學習計畫</h2>
          <div
            className={cn(
              "w-full flex flex-col justify-between bg-white rounded-xl",
              "py-3 px-3 md:px-6")
            }
            style={{
              boxShadow: '0px 4px 10px 0px rgba(196, 194, 193, 0.40)'
            }}
          >
            <div className="flex flex-row justify-between gap-3">
              <Select
                isDisabled={!isEditPermitted}
                options={options}
                className="max-w-[200px]"
              />
              <Button
                isDisabled={isAddedDenied}
                variant="solid"
                className="hover:cursor-pointer flex-shrink-0"
              >
                新增計畫
              </Button>
            </div>
            {
              isAddedDenied && (
                <p className="font-sans font-normal text-[#FF9526]">
                  島上空間有限，計畫滿三個就不能再增加了{`><`}
                </p>
              )
            }
          </div>
          {isEditPermitted ? (
            <div className="
              flex flex-col md:flex-row
              gap-5"
            >
              {
                projects.map((project) => {
                  return (
                    <div
                      key={project.id}
                      className="
                      w-full md:w-1/3
                      rounded-[10px]
                      flex flex-col gap-[10px]
                      bg-white"
                      style={{
                        boxShadow: '0px 4px 10px 0px rgba(196, 194, 193, 0.40)'
                      }}
                    >
                      <img
                        src={emptyCoverImg.src}
                        alt="學習計畫封面圖"
                        className="rounded-[10px] object-cover max-h-[117px]"
                      />
                      <div className="
                        flex flex-col gap-[10px]
                        px-[10px] pb-[10px]"
                      >
                        <p className="
                          font-sans
                          text-basic-500 text-sm font-bold leading-[140%]"
                        >
                          {project.title}
                        </p>
                        <p className="
                          font-sans
                          text-basic-400 text-sm font-normal leading-[140%]"
                        >
                          {getProjectType(project.eventId)}
                        </p>
                        <div className="flex flex-row justify-between">
                          <p className="bg-primary-lightest py-[3px] px-[10px] rounded-[4px] inline-flex flex-row gap-1 items-center text-primary-base body-sm">
                            <CircleIcon className="text-primary-base max-w-2 max-h-2" />
                            <span className="font-sans text-xs font-bold leading-[140%]">{project.isPublic ? '公開' : '不公開'}</span>
                          </p>
                          <More projectId={project.id} />
                        </div>
                      </div>
                    </div>
                  );
                })
              }
            </div>
          ) :
            (<AccessDenied />)
          }
        </div>
      </div>
    </ProtectedComponent>
  );
};
export default Projects;
