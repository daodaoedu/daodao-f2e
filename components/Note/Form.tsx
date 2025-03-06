import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import dayjs from 'dayjs';
import PostCard from '@/shared/components/Post/PostCard';
import Button from '@/shared/components/Button';
import Form from '@/shared/components/Form';
import {
  CreateProjectNoteRequest,
  createProjectNoteSchema,
  UpdateProjectNoteRequest,
  updateProjectNoteSchema,
} from '@/services/projects/notes';
import numberToChineseNumber from '@/utils/numberToChineseNumber';
import Upload from '@/shared/components/Upload';
import Image from '@/shared/components/Image';

interface BaseNoteFormProps {
  projectId: string;
  projectTitle: string;
  week: number;
  createdAt?: string;
  isLoading: boolean;
  defaultValues?: UpdateProjectNoteRequest;
}

type NoteFormProps = BaseNoteFormProps &
  (
    | { id: number; onSubmit: (data: UpdateProjectNoteRequest) => void }
    | { id?: never; onSubmit: (data: CreateProjectNoteRequest) => void }
  );

function NoteForm({
  id,
  projectId,
  projectTitle,
  week,
  createdAt,
  defaultValues,
  isLoading,
  onSubmit,
}: NoteFormProps) {
  const [previewImage, setPreviewImage] = useState<string | null>(
    defaultValues?.imgUrls?.[0] ?? null
  );

  const methods = useForm<
    typeof id extends never
      ? CreateProjectNoteRequest
      : UpdateProjectNoteRequest
  >({
    resolver: zodResolver(
      id ? updateProjectNoteSchema : createProjectNoteSchema
    ),
    defaultValues: {
      id,
      projectId,
      title: projectTitle,
      date: dayjs(createdAt || undefined).format('YYYY-MM-DD'),
      week,
      content: '',
      imgUrls: [],
      ...defaultValues,
    },
  });

  return (
    <Form methods={methods} onSubmit={onSubmit}>
      <PostCard className="p-0 md:p-0">
        <PostCard.Header
          title={methods.watch('title')}
          subtitle={`第${numberToChineseNumber(week)}週`}
          tag="便利貼"
          date={dayjs(createdAt).format('YYYY/MM/DD')}
          onTitleChange={(title) =>
            methods.setValue('title', title || projectTitle)
          }
          isEditable
        />
      </PostCard>
      <textarea
        className="w-full h-80 px-2 py-1 body-sm focus-within:outline-none resize-none"
        placeholder="請填寫便利貼內容"
        {...methods.register('content')}
      />
      <div className="px-2">
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
                methods.setValue("imgFiles", []);
                methods.setValue("imgUrls", []);
                setPreviewImage(null);
              }}
            />
          </div>
        )}
        <Upload
          variant="solid"
          color="secondary"
          onPreviewChange={([preview]) => setPreviewImage(preview)}
          onFilesChange={([file]) => methods.setValue('imgFiles', [file])}
        >
          {previewImage ? '更換圖片' : '加入圖片'}
        </Upload>
      </div>
      <div className="flex justify-end gap-5">
        <Button variant="solid" color="primary" isSubmit isDisabled={isLoading}>
          發布
        </Button>
      </div>
    </Form>
  );
}

export default NoteForm;
