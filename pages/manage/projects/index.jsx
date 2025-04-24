import { useMemo } from 'react';
import { useRouter } from 'next/router';
import { RoleEnum, useAuth, ProtectedComponent } from '@/contexts/Auth';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import Select from '@/components/Projects/Form/Select';
import SEOConfig from '@/shared/components/SEO';
import AccessDenied from '@/shared/components/AccessDenied';
import GoBackButton from '@/components/Projects/GoBackButton';
import emptyCoverImg from '@/public/assets/empty-cover.png';
import CircleIcon from '@mui/icons-material/Circle';
import { useMyProjects } from '@/services/modules/projects';
import More from '@/components/Projects/More';
import Button from '@/shared/components/Button';
import { cn } from '@/utils/cn';
import toast from 'react-hot-toast';

const Projects = () => {
  const maxProjects = 3;
  const router = useRouter();
  const { user } = useAuth();
  const { data } = useMyProjects();
  const projects = Array.isArray(data) ? data : [];
  const isAddedDenied = projects.length >= maxProjects;
  const isEditPermitted = useMemo(() => {
    const permissions = [
      RoleEnum.MarathonApplicant,
      RoleEnum.MarathonParticipant,
      RoleEnum.Mentor,
      RoleEnum.Admin,
      RoleEnum.SuperAdmin,
    ];
    return user ? permissions.includes(user?.role) : false;
  }, [user]);
  const options = [
    { value: "all", label: "全部計畫" },
    { value: "learning-marathon", label: "學習馬拉松" },
  ];
  const getProjectType = (eventId) => {
    switch (eventId) {
      case "2025S1":
        return "2025春季盃學習馬拉松";
      default:
        return "學習計畫";
    }
  };

  const handleCreateProject = () => {
    toast.error('功能尚未開放');
    // if (isAddedDenied) {
    //   toast.error('島上空間有限，\n計畫滿三個就不能再增加了><');
    // } else {
    //   router.push('/manage/project/create');
    // }
  };

  const SEOData = useMemo(
    () => ({
      title: '學習計畫｜島島阿學',
      description:
        '「島島阿學」盼能透過建立多元的學習資源網絡，讓自主學習者能找到合適的成長方法，進一步成為自己想成為的人，從中培養共好精神。目前正積極打造「可共編的學習資源平台」。',
      keywords: '島島阿學',
      author: '島島阿學',
      copyright: '島島阿學',
      imgLink: 'https://www.daoedu.tw/preview.webp',
      link: `${process.env.HOSTNAME}/manage/projects`,
    }),
    []
  );

  return (
    <ProtectedComponent>
      <SEOConfig data={SEOData} />
      <div className="bg-[#F3FCFC] md:py-8 min-h-screen-without-padding-top">
        <div className="w-full p-4
          md:max-w-[860px] mx-auto box-border flex flex-col gap-6"
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
                onClick={handleCreateProject}
                variant="solid"
                color="primary"
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
                      role="button"
                      tabIndex={0}
                      className="w-full md:w-1/3 rounded-[10px] flex flex-col gap-[10px] bg-white cursor-pointer"
                      onClick={() => router.push(`/manage/project?id=${project.id}`)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          router.push(`/manage/project?id=${project.id}`);
                        }
                      }}
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
