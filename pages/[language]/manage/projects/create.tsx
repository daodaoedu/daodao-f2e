import { useMemo, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import toast from 'react-hot-toast';

import { ProtectedComponent } from '@/contexts/Auth';
import { Project, DEFAULT_PROJECT } from '@/components/Projects/Project/type';
import Container from '@/shared/components/Container';
import EditMode from '@/components/Projects/Project/EditMode';
import SEOConfig from '@/components/SEOConfig';
import {
  createProjectSchema,
  useProjectMutation,
} from '@/services/projects';
import { useCreateProject } from '@/features/projects';

const ProjectPage = () => {
  const router = useRouter();
  const pathname = usePathname();
  const SEOData = useMemo(
    () => ({
      title: '新增計畫｜多元學習資源平台｜島島阿學',
      keywords: '島島阿學',
      author: '島島阿學',
      copyright: '島島阿學',
      imgLink: 'https://www.daoedu.tw/assets/brand/horizontal-primary-logo.svg',
      link: `${process.env.HOSTNAME}${pathname}`,
    }),
    [pathname]
  );
  const [formData, setFormData] = useState<Partial<Project>>(DEFAULT_PROJECT);
  const { createMutation } = useProjectMutation({
    onCreated: (data) => {
      if (data?.id) {
        toast.success('新增成功');
        router.push(`/manage/projects/detail?id=${data.id}`);
      } else {
        toast.error('系統異常，請稍後再試');
      }
    },
  });

  const handleOnClickCancel = () => {
    setFormData(DEFAULT_PROJECT);
  };

  const handleSubmit = async () => {
    const project = createProjectSchema.parse(formData);
    await createMutation.trigger(project);
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

  const { canCreateProject } = useCreateProject();

  return (
    <ProtectedComponent>
      <SEOConfig {...SEOData} />

      <Container className="flex justify-center pb-12 px-4" autoMinHeight>
        <div className="max-w-3xl">
          {canCreateProject && (
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
