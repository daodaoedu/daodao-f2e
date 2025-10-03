import { getManageProjectLayout } from '@/layout/features/getProjectLayout';
import { Project, DEFAULT_PROJECT } from '@/components/Projects/Project/type';
import { useMemo, useState } from 'react';
import SEOConfig, { JsonLdType } from '@/components/SEOConfig';
import { Skeleton } from '@/shared/ui/skeleton';
import useMediaQuery from '@/shared/lib/use-media-query';

import { useProject } from '@/contexts/Project';
import EditMode from '@/components/Projects/Project/EditMode';
import ViewMode from '@/components/Projects/Project/ViewMode';
import toast from 'react-hot-toast';

const ProjectPage = () => {
  // same with tailwind lg:
  const isLgScreen = useMediaQuery('isMedium');
  const jsonLd = useMemo<JsonLdType>(
    () => ({
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@context': 'https://schema.org',
          '@type': 'WebSite',
          url: 'https://www.daoedu.tw',
          potentialAction: {
            '@type': 'SearchAction',
            'query-input': 'required name=q',
            target: 'https://www.daoedu.tw/search?q={q}',
          },
        },
        {
          '@context': 'https://schema.org',
          '@type': 'Organization',
          url: 'https://www.daoedu.tw',
          logo: 'https://www.daoedu.tw/assets/brand/favicon-112.png',
        },
      ],
    }),
    []
  );
  const { project, dispatchProject, isFetching } = useProject();
  const [formData, setFormData] = useState<Partial<Project>>(project);
  const [isEditing, setIsEditing] = useState(false);

  const handleOnClickEdit = () => {
    if (project) {
      setFormData(project);
      setIsEditing(true);
    }
  };
  const handleOnClickCancel = () => {
    setFormData(DEFAULT_PROJECT);
    setIsEditing(false);
  };

  const handleOnClickUpdate = async () => {
    const success = await dispatchProject(formData);
    if (success) {
      toast.success('更新成功');
      setIsEditing(false);
    } else {
      toast.error('更新失敗，請稍後再試');
    }
  };

  const handleChangeInput = (
    event:
      | React.ChangeEvent<HTMLInputElement>
      | React.ChangeEvent<HTMLTextAreaElement>
      | React.ChangeEvent<HTMLSelectElement>
  ) => {
    const { name, type } = event.target;
    const value =
      type === 'checkbox'
        ? (event.target as HTMLInputElement).checked
        : event.target.value;

    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleChangeSelected = (name: string, value: string[]) => {
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleChangeResourceName = (value: string) => {
    setFormData({
      ...formData,
      resourceName: value,
    });
  };

  return (
    <div>
      <SEOConfig
        title="島島盃 - 2025 春季學習馬拉松｜多元學習資源平台｜島島阿學"
        description="「島島阿學」盼能透過建立多元的學習資源網絡，讓自主學習者能找到合適的成長方法，進一步成為自己想成為的人，從中培養共好精神。目前正積極打造「可共編的學習資源平台」。"
        jsonLd={jsonLd}
      />
      {isFetching ? (
        <>
          <Skeleton className="w-full h-[120px] mb-3" />
          <Skeleton className="w-full h-[300px]" />
        </>
      ) : isEditing ? (
        <EditMode
          project={formData}
          onClickCancel={handleOnClickCancel}
          onClickUpdate={handleOnClickUpdate}
          onChangeInput={handleChangeInput}
          onChangeSelected={handleChangeSelected}
          onChangeResourceName={handleChangeResourceName}
        />
      ) : (
        <ViewMode
          project={project}
          isLgScreen={isLgScreen}
          onClick={handleOnClickEdit}
        />
      )}
    </div>
  );
};

ProjectPage.getLayout = getManageProjectLayout;

export default ProjectPage;
