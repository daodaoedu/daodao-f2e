'use client';

import { useState } from 'react';
import { useRouter } from '@/shared/i18n/navigation';
import toast from 'react-hot-toast';
import { Project, DEFAULT_PROJECT } from '@/components/Projects/Project/type';
import EditMode from '@/components/Projects/Project/EditMode';
import {
  createProjectSchema,
  useProjectMutation,
} from '@/services/projects';

export default function CreateProjectPage() {
  const router = useRouter();

  const [formData, setFormData] = useState<Partial<Project>>(DEFAULT_PROJECT);
  const { createMutation } = useProjectMutation({
    onCreated: (data) => {
      if (data?.id) {
        toast.success('新增成功');
        router.push(`/projects/detail?id=${data.id}`);
      } else {
        toast.error('系統異常，請稍後再試');
      }
    },
  });

  const handleOnClickCancel = () => {
    router.push('/explore');
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

  return (
    <div className="min-h-screen bg-basic-white pt-20">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-12">
        <EditMode
          project={formData}
          onClickCancel={handleOnClickCancel}
          onClickUpdate={handleSubmit}
          onChangeInput={handleChangeInput}
          onChangeSelected={handleChangeSelected}
          onChangeResourceName={handleChangeResourceName}
        />
      </div>
    </div>
  );
}
