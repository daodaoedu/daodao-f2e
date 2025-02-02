import getProjectLayout from '@/layout/ProjectLayout';
import { Project, DEFAULT_PROJECT } from '@/components/Projects/Project/projectType';
import { useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import SEOConfig from '@/shared/components/SEO';
import { Skeleton, useMediaQuery } from "@mui/material";

import { ProtectedComponent } from '@/contexts/Auth';
import { useProject } from '@/contexts/Project';
import EditMode from '@/components/Projects/Project/EditMode';
import ViewMode from '@/components/Projects/Project/ViewMode';

const ProjectPage = () => {
  const router = useRouter();

  // same with tailwind lg:
  const isLgScreen = useMediaQuery('(min-width: 767px)');
  const SEOData = useMemo(
    () => ({
      title: '島島盃 - 2025 春季學習馬拉松｜多元學習資源平台｜島島阿學',
      description:
        '「島島阿學」盼能透過建立多元的學習資源網絡，讓自主學習者能找到合適的成長方法，進一步成為自己想成為的人，從中培養共好精神。目前正積極打造「可共編的學習資源平台」。',
      keywords: '島島阿學',
      author: '島島阿學',
      copyright: '島島阿學',
      imgLink: 'https://www.daoedu.tw/preview.webp',
      link: `${process.env.HOSTNAME}${router?.asPath}`,
      structuredData: [
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
          logo: 'https://www.daoedu.tw/favicon-112.png',
        },
      ],
    }),
    [router?.asPath],
  );
  const { project, isLoading, useDispatchProject } = useProject();
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

  const handleOnClickUpdate = () => {
    useDispatchProject(formData);
  };

  const handleChangeInput = (
    event:
      React.ChangeEvent<HTMLInputElement> |
      React.ChangeEvent<HTMLTextAreaElement> |
      React.ChangeEvent<HTMLSelectElement>
  ) => {
    const { name, value } = event.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleChangeSelected = (name: string, value: string[]) => {
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleChangeResourceName = (value: string[]) => {
    setFormData({
      ...formData,
      resourceName: value
    });
  };

  return (
    <ProtectedComponent>
      <div className="">
        <SEOConfig data={SEOData} />
        {
          isLoading ? (
            <>
              <Skeleton
                variant="rectangular"
                width="100%"
                height={120}
                animation="wave"
                className="mb-3"
              />
              <Skeleton
                variant="rectangular"
                width="100%"
                height={300}
                animation="wave"
              />
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
          )
        }
      </div>
    </ProtectedComponent>
  );
};

ProjectPage.getLayout = (page: React.ReactElement) =>
  getProjectLayout(page, undefined);

export default ProjectPage;
