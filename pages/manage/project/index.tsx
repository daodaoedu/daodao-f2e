import getProjectLayout from '@/layout/ProjectLayout';
import { Project, DEFAULT_PROJECT } from '@/components/Projects/Project/projectType';
import { useMemo, useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import SEOConfig from '@/shared/components/SEO';
import { Skeleton, useMediaQuery } from "@mui/material";
import { BASE_URL } from "@/constants/common";
import { z } from 'zod';

import { ProtectedComponent, useAuth } from '@/contexts/Auth';
import toast from 'react-hot-toast';
import EditMode from '@/components/Projects/Project/EditMode';
import ViewMode from '@/components/Projects/Project/ViewMode';

type ProjectResponse = {
  data: Project
};
const idSchema = z.string().regex(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/);

function validateIdWithZod(id: string) {
  try {
    const result = idSchema.parse(id);
    return {
      isValid: true,
      value: result
    };
  } catch (error) {
    return {
      isValid: false,
      error
    };
  }
}

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
  const { user } = useAuth();
  const { id } = router.query;
  const [project, setProject] = useState<Partial<Project>>(DEFAULT_PROJECT);
  const [formData, setFormData] = useState<Partial<Project>>(DEFAULT_PROJECT);
  const [isLoading, setIsLoading] = useState(true);
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
    console.log('update', formData);
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

  useEffect(() => {
    if (!router.isReady || !user?._id) return;

    if (!id) {
      toast.error('喔噢！找不到這則學習檔案');
      router.push('/manage/projects');
      return;
    }
    const projectId = Array.isArray(id) ? id[0] : id;
    const validation = validateIdWithZod(projectId);
    if (!validation.isValid) return;

    const fetchProjectData = async () => {
      try {
        const response = await fetch(`${BASE_URL}/marathon/${projectId}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const responseData: ProjectResponse = await response.json();
        if (!responseData || !responseData.data) {
          throw new Error('Invalid response structure');
        }

        // json parse response data
        const result = responseData.data;

        // set marathon data
        setProject(result);
        setFormData(result);
      } catch (error) {
        console.error('error fetching data', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProjectData();
  }, [id, user, router]);

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
            />
          ) : (
            <ViewMode
              project={project}
              user={user}
              isLgScreen={isLgScreen}
              onClick={handleOnClickEdit}
            />
          )
        }
      </div>
    </ProtectedComponent>
  );
};

ProjectPage.getLayout = getProjectLayout;

export default ProjectPage;
