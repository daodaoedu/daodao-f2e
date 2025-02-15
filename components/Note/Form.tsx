import toast from 'react-hot-toast';
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
} from '@/services/project/notes';
import numberToChineseNumber from '@/utils/numberToChineseNumber';

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
      description: '',
      imgUrl: null,
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
        {...methods.register('description')}
      />
      <div className="px-2">
        <Button
          variant="solid"
          color="secondary"
          onClick={() => toast.error('尚未開放')}
        >
          加入圖片
        </Button>
      </div>
      <div className="flex justify-end gap-5">
        <Button
          className="text-primary-base"
          isDisabled={isLoading}
          onClick={() => toast.error('尚未開放')}
        >
          儲存草稿
        </Button>
        <Button variant="solid" color="primary" isSubmit isDisabled={isLoading}>
          發布
        </Button>
      </div>
    </Form>
  );
}

export default NoteForm;
