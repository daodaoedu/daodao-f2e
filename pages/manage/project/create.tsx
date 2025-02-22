import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import toast from 'react-hot-toast';

import { ProtectedComponent } from '@/contexts/Auth';
import { Project, DEFAULT_PROJECT } from '@/components/Projects/Project/type';
import Container from '@/shared/components/Container';
import EditMode from '@/components/Projects/Project/EditMode';
import SEOConfig from '@/shared/components/SEO';
import { useProjectList } from '@/hooks/api/project';
import { createProjectSchema } from '@/services/project';

const ProjectPage = () => {
  const router = useRouter();

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
    [router?.asPath]
  );
  const [formData, setFormData] = useState<Partial<Project>>(DEFAULT_PROJECT);
  const maxProjects = 3;
  const { data: projects, create } = useProjectList({
    isMe: true,
    onCreated: (data) => {
      toast.success('新增成功');
      router.push(`/manage/project?id=${data.id}`);
    },
  });

  const handleOnClickCancel = () => {
    setFormData(DEFAULT_PROJECT);
  };

  const handleSubmit = async () => {
    const project = createProjectSchema.parse(formData);
    await create.trigger(project);
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

  useEffect(() => {
    if (projects && projects.length >= maxProjects) {
      toast.error('島上空間有限，\n計畫滿三個就不能再增加了><');
      router.replace('/manage/projects');
    }
  }, [projects, maxProjects, router]);

  return (
    <ProtectedComponent>
      <SEOConfig data={SEOData} />

      <Container className="flex justify-center pb-12 px-4" autoMinHeight>
        <div className="max-w-3xl">
          {Array.isArray(projects) && projects.length < maxProjects && (
            <EditMode
              project={formData}
              onClickCancel={handleOnClickCancel}
              onClickUpdate={handleSubmit}
              onChangeInput={handleChangeInput}
              onChangeSelected={handleChangeSelected}
              onChangeResourceName={handleChangeResourceName}
            />
          )}
        </div>
      </Container>
    </ProtectedComponent>
  );
};

export default ProjectPage;
