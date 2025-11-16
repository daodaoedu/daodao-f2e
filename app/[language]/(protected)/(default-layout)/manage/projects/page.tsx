'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { ProtectedComponent } from '@/entities/user';
import { Circle } from 'lucide-react';
import Select from '@/components/Projects/Form/Select';
import SEOConfig from '@/components/SEOConfig';
import emptyCoverImg from '@/public/assets/images/empty-cover.png';
import { useMyProjects } from '@/services/projects';
import More from '@/components/Projects/More';
import { cn } from '@/shared/lib/cn';
// import useCreateProject from '@/features/projects/hooks/useCreateProject';
import { BackButton } from '@/shared/ui/back-button';

export default function ManageProjectsPage() {
  const router = useRouter();
  const { data } = useMyProjects();
  const projects = Array.isArray(data) ? data : [];
  const options = [
    { value: 'all', label: '全部計畫' },
    { value: 'learning-marathon', label: '學習馬拉松' },
  ];
  const getProjectType = (eventId: string | undefined) => {
    switch (eventId) {
      case '2025S1':
        return '2025春季盃學習馬拉松';
      default:
        return '學習計畫';
    }
  };

  // const { isAddedDenied, handleCreateProject, projectLimitMessage } =
  //   useCreateProject();

  const SEOData = useMemo(
    () => ({
      title: '學習計畫｜島島阿學',
      description:
        '「島島阿學」盼能透過建立多元的學習資源網絡，讓自主學習者能找到合適的成長方法，進一步成為自己想成為的人，從中培養共好精神。目前正積極打造「可共編的學習資源平台」。',
      keywords: '島島阿學',
      author: '島島阿學',
      copyright: '島島阿學',
      imgLink: 'https://www.daoedu.tw/assets/brand/horizontal-primary-logo.svg',
      link: `${process.env.PROD_URL}/manage/projects`,
    }),
    []
  );

  return (
    <ProtectedComponent>
      <SEOConfig {...SEOData} />
      <div className="min-h-screen-without-padding-top bg-[#F3FCFC] md:py-8">
        <div className="mx-auto box-border flex w-full flex-col gap-6 p-4 md:max-w-[860px]">
          <BackButton
            onClick={() => router.push('/manage')}
            label="返回 我的小島"
          />
          <h2 className="heading-md text-basic-400">學習計畫</h2>
          <div
            className={cn(
              'flex w-full flex-col justify-between rounded-xl bg-white',
              'px-3 py-3 md:px-6'
            )}
            style={{
              boxShadow: '0px 4px 10px 0px rgba(196, 194, 193, 0.40)',
            }}
          >
            <div className="flex flex-row justify-between gap-3">
              <div className="flex flex-row items-center gap-3">
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
            <div className="mt-3 flex flex-row items-center gap-3">
              <div className="flex flex-row items-center gap-2">
                <Circle className="size-2 text-primary-base" />
                <span className="text-basic-300">請選擇集合</span>
              </div>
              <Select options={options} isDisabled={false} />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {projects.map(({ id, title, eventId }) => (
              <div
                key={id}
                className={cn(
                  'flex w-full flex-col justify-between rounded-xl bg-white',
                  'px-3 py-3 md:px-6'
                )}
                style={{
                  boxShadow: '0px 4px 10px 0px rgba(196, 194, 193, 0.40)',
                }}
              >
                <div className="flex flex-row justify-between gap-3">
                  <div className="flex flex-row items-center gap-3">
                    <img
                      src={emptyCoverImg.src}
                      alt={title}
                      width={40}
                      height={40}
                      className="rounded-[6px]"
                    />
                    <span className="text-basic-400">{title}</span>
                  </div>
                  <More projectId={id} />
                </div>
                <div className="mt-3 flex flex-row items-center gap-3">
                  <div className="flex flex-row items-center gap-2">
                    <Circle className="size-2 text-primary-base" />
                    <span className="text-basic-300">
                      {getProjectType(eventId)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </ProtectedComponent>
  );
}
