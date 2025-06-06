import React from 'react';
import { IdeaSchema, UpdateIdeaSchema } from '@/services/modules/ideas/schema';
import { Button } from '@/components/atoms';
import IdeaForm from '../IdeaForm';

interface UpdateModalProps {
  id: string;
  defaultValues: IdeaSchema;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: UpdateIdeaSchema) => void;
  isLoading: boolean;
}

const UpdateModal: React.FC<UpdateModalProps> = ({
  id,
  defaultValues,
  isOpen,
  onClose,
  onSubmit,
  isLoading,
}) => {
  const handleSubmit = (data: UpdateIdeaSchema) => {
    onSubmit(data);
  };

  const formDefaultValues = {
    title: defaultValues.title,
    content: defaultValues.content,
    tags: defaultValues.tags,
    imageUrls: defaultValues.imageUrls,
    videoUrls: defaultValues.videoUrls,
    visibility: defaultValues.visibility,
    ideaResources: defaultValues.ideaResources,
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* 背景遮罩 */}
      <div
        className="fixed inset-0 bg-black/30"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal 內容 */}
      <div className="relative bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto m-4">
        <div className="p-6">
          {/* 標題 */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              編輯 Idea
            </h2>
            <Button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </Button>
          </div>

          {/* 表單 */}
          <IdeaForm
            id={id}
            defaultValues={formDefaultValues}
            onSubmit={handleSubmit}
            isLoading={isLoading}
            onCancel={onClose}
          />
        </div>
      </div>
    </div>
  );
};

export default UpdateModal;
