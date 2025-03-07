import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import PostCard from '@/shared/components/Post/PostCard';
import Button from '@/shared/components/Button';
import Form from '@/shared/components/Form';
import {
  CreateIdeaRequest,
  createIdeaSchema,
  UpdateIdeaRequest,
  updateIdeaSchema,
} from '@/services/ideas';
import Upload from '@/shared/components/Upload';
import Image from '@/shared/components/Image';
import { MdLink, MdDelete } from "react-icons/md";
import AddResourceForm from './AddResourceForm'; // <— 這就是剛才的小表單

// 分別為建立與更新模式定義 Props
interface IdeaFormCreateProps {
  id?: undefined;
  isLoading: boolean;
  defaultValues?: CreateIdeaRequest;
  onSubmit: (data: CreateIdeaRequest) => void;
}

interface IdeaFormUpdateProps {
  id: string;
  isLoading: boolean;
  defaultValues?: UpdateIdeaRequest;
  onSubmit: (data: UpdateIdeaRequest) => void;
}

// 利用 union 來定義 IdeaForm 的 props
type IdeaFormProps = IdeaFormCreateProps | IdeaFormUpdateProps;
function IdeaForm({
  id,
  defaultValues,
  isLoading,
  onSubmit,
}: IdeaFormProps) {
  const [previewImage, setPreviewImage] = useState<string | null>(
    defaultValues?.imageUrls?.[0] ?? null
  );
  // const [previewVideo, setPreviewVideo] = useState<string | null>(
  //   defaultValues?.videoUrls?.[0] ?? null
  // );

  // 用來切換「是否在新增資源中」
  const [isAddingResource, setIsAddingResource] = useState(false);

  // 1. 設定 resolver
  const resolver = zodResolver(id ? updateIdeaSchema : createIdeaSchema);

  // 2. 建立 form
  const methods = useForm<CreateIdeaRequest | UpdateIdeaRequest>({
    resolver,
    defaultValues: {
      title: '',
      content: '',
      imageUrls: [],
      videoUrls: [],
      visibility: 'public',
      ideaResources: [],
      ...defaultValues,
    },
  });

  // 3. 建立 useFieldArray
  const { fields, append, remove } = useFieldArray({
    control: methods.control,
    name: 'ideaResources',
  });

  // 4. 送出表單
  const handleFormSubmit = (data: CreateIdeaRequest | UpdateIdeaRequest) => {
    if (typeof id === 'string') {
      onSubmit(data as UpdateIdeaRequest);
    } else {
      onSubmit(data as CreateIdeaRequest);
    }
  };

  return (
    <Form methods={methods} onSubmit={handleFormSubmit}>
      <PostCard className="p-0 md:p-0">
        <PostCard.Header
          title={methods.watch('title')}
          subtitle="Idea"
          tag="想法"
          onTitleChange={(title) => methods.setValue('title', title)}
          isEditable
        />
      </PostCard>

      <textarea
        className="w-full h-60 px-2 py-1 body-sm focus-within:outline-none resize-none"
        placeholder="請填寫 Idea 內容"
        {...methods.register('content')}
      />
      {/* 圖片上傳 */}
      <div className="px-2 mt-4">
        {previewImage && (
          <div className="relative group mb-4">
            <Image
              src={previewImage}
              alt="preview"
              width="100%"
              height="300px"
              className="object-contain"
            />
            <span className="absolute inset-0 bottom-1.5 group-hover:bg-basic-black/20 transition-colors rounded-lg" />
            <Button
              variant="solid"
              color="alert"
              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-2"
              prefixIcon="AiOutlineClose"
              onClick={() => {
                methods.setValue('imageUrls', []);
                setPreviewImage(null);
              }}
            />
          </div>
        )}
        <Upload
          variant="solid"
          color="secondary"
          onPreviewChange={([preview]) => setPreviewImage(preview)}
          onFilesChange={([file]) => methods.setValue('imageFiles', [file])}
        >
          {previewImage ? '更換圖片' : '加入圖片'}
        </Upload>
      </div>

      {/* 學習資源 */}
      <div className="px-2 mt-4">
        <h3 className="mb-2 text-basic-500 font-sans font-medium text-[16px] leading-[150%]">
          學習資源
        </h3>
        <p className="text-sm text-gray-500 mb-3">
          例如：可以是影片、書籍、網站、文章、活動等連結，讓他人可進一步參考。
        </p>
        {/* 如果 isAddingResource 為 true，就顯示子表單 */}
        {isAddingResource ? (
          <AddResourceForm
            onConfirm={(data) => {
              // Ensure data has an id property
              const resourceData = {
                id: Date.now(), // or any unique identifier logic
                ...data,
              };
              append(resourceData);
              setIsAddingResource(false);
            }}
            onCancel={() => setIsAddingResource(false)}
          />
        ) : (
          <Button
            variant="solid"
            color="secondary"
            onClick={() => setIsAddingResource(true)}
          >
            新增資源
          </Button>
        )}

        {/* 已新增的資源清單 */}
        {fields.map((field, index) => (
          <div
            key={field.id}
            className="flex flex-col md:flex-row gap-2 mb-2 mt-2"
          >
            <div className="w-full ">
              <label htmlFor="resource-name" className="text-sm text-gray-600">資源名稱
                {/* 讓 input 與 icon 同框：以一個 relative 容器包住 */}
                <div className="relative">
                  <input
                    id="resource-name"
                    type="text"
                    className="
                  border
                  px-2 py-1
                  rounded-lg
                  w-full
                  pr-8
                  border-basic-200

                  /* 滑鼠懸停時的邊框顏色 */
                  hover:border-primary-base

                  /* 聚焦（focus）時的邊框 & 外圈 */
                  focus:outline-none
                  focus:border-primary-base
                  focus:ring-1
                  focus:ring-primary-base
                "
                    {...methods.register(`ideaResources.${index}.name` as const)}
                  />
                  {/* 鏈接圖示：稍微往左 */}
                  <MdLink
                    size={18}
                    color="#92989A"
                    className="absolute right-8 top-1/2 -translate-y-1/2
                         text-gray-600"
                  />
                  {/* 刪除按鈕：右側最靠近邊緣 */}
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    className="absolute right-2 top-1/2 -translate-y-1/2
                         text-gray-600 hover:text-gray-800"
                  >
                    <MdDelete size={18} color="#92989A" />
                  </button>
                </div>
              </label>
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-end gap-5 mt-4">
        <Button variant="solid" color="primary" isSubmit isDisabled={isLoading}>
          發布
        </Button>
      </div>
    </Form>
  );
}

export default IdeaForm;
