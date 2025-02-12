import { useRouter } from 'next/router';
// import { useSelector } from 'react-redux';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import Select from '@/components/Projects/Form/Select';
import AccessDenied from '@/shared/components/AccessDenied';
import GoBackButton
  from '@/components/Projects/GoBackButton';
import { ProtectedComponent } from '@/contexts/Auth';
import emptyCoverImg from '@/public/assets/empty-cover.png';
import CircleIcon from '@mui/icons-material/Circle';
import { useProjectList } from '@/hooks/api/project';
import More from '@/components/Projects/More';
import Button from '@/shared/components/Button';
import { cn } from '@/utils/cn';

const Projects = () => {
  const maxProjects = 3;
  const router = useRouter();
  // const userState = useSelector((state) => state.user);
  const { data } = useProjectList({ isMe: true });
  // const projects = Array.isArray(userState.marathons) ? userState.marathons : [];
  const projects = Array.isArray(data) ? data : [];
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
