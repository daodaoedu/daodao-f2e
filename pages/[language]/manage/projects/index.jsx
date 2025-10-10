import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { ProtectedComponent } from '@/features/auth';
import { ChevronLeft, Circle } from 'lucide-react';
import Select from '@/components/Projects/Form/Select';
import SEOConfig from '@/components/SEOConfig';
import GoBackButton from '@/components/Projects/GoBackButton';
import emptyCoverImg from '@/public/assets/images/empty-cover.png';
import { useMyProjects } from '@/services/projects';
import More from '@/components/Projects/More';
import { cn } from '@/utils/cn';
import { useMarathonAccess } from '@/features/projects';
import useCreateProject from '@/features/projects/hooks/useCreateProject';

const Projects = () => {
  const router = useRouter();
  const { data } = useMyProjects();
  const projects = Array.isArray(data) ? data : [];
  const hasMarathonAccess = useMarathonAccess();
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

  const { isAddedDenied, handleCreateProject, projectLimitMessage } = useCreateProject();

  const SEOData = useMemo(
    () => ({
      title: '學習計畫｜島島阿學',
      description:
        '「島島阿學」盼能透過建立多元的學習資源網絡，讓自主學習者能找到合適的成長方法，進一步成為自己想成為的人，從中培養共好精神。目前正積極打造「可共編的學習資源平台」。',
      keywords: '島島阿學',
      author: '島島阿學',
      copyright: '島島阿學',
      imgLink: 'https://www.daoedu.tw/assets/brand/horizontal-primary-logo.svg',
      link: `${process.env.HOSTNAME}/manage/projects`,
    }),
    []
  );

  return (
    <ProtectedComponent>
      <SEOConfig {...SEOData} />
      <div className="bg-[#F3FCFC] md:py-8 min-h-screen-without-padding-top">
        <div className="w-full p-4
          md:max-w-[860px] mx-auto box-border flex flex-col gap-6"
        >
          <GoBackButton
            onClick={() => router.push('/manage')}
            icon={
              (
                <ChevronLeft
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
              <div className="flex flex-row gap-3 items-center">
                <img
                  src={emptyCoverImg.src}
                  alt="空的計畫封面"
                  width={40}
                  height={40}
                  className="rounded-[6px]"
                />
                <span className="text-basic-400">新計畫</span>
              </div>
              <More projectId="new" />
            </div>
            <div className="mt-3 flex flex-row gap-3 items-center">
              <div className="flex flex-row items-center gap-2">
                <Circle className="text-primary-base w-2 h-2" />
                <span className="text-basic-300">請選擇集合</span>
              </div>
              <Select options={options} isDisabled={!hasMarathonAccess} />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {projects.map(({ _id, title, coverImage, eventId }) => (
              <div key={_id}
                className={cn(
                  "w-full flex flex-col justify-between bg-white rounded-xl",
                  "py-3 px-3 md:px-6")
                }
                style={{
                  boxShadow: '0px 4px 10px 0px rgba(196, 194, 193, 0.40)'
                }}
              >
                <div className="flex flex-row justify-between gap-3">
                  <div className="flex flex-row gap-3 items-center">
                    <img
                      src={coverImage || emptyCoverImg.src}
                      alt={title}
                      width={40}
                      height={40}
                      className="rounded-[6px]"
                    />
                    <span className="text-basic-400">{title}</span>
                  </div>
                  <More projectId={_id} />
                </div>
                <div className="mt-3 flex flex-row gap-3 items-center">
                  <div className="flex flex-row items-center gap-2">
                    <Circle className="text-primary-base w-2 h-2" />
                    <span className="text-basic-300">{getProjectType(eventId)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </ProtectedComponent>
  );
};

export default Projects;
