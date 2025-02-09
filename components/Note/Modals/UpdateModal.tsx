import toast from 'react-hot-toast';
import dayjs from 'dayjs';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Modal from '@/shared/components/Modal';
import PostCard from '@/shared/components/Post/PostCard';
import Button from '@/shared/components/Button';
import Form from '@/shared/components/Form';
import {
  UpdateProjectNoteRequest,
  updateProjectNoteSchema,
} from '@/services/project/notes';
import numberToChineseNumber from '@/utils/numberToChineseNumber';

interface UpdateModalProps {
  id: number;
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  projectTitle: string;
  week: number;
  createdAt?: string;
  isLoading: boolean;
  defaultValues?: UpdateProjectNoteRequest;
  onSubmit: (data: UpdateProjectNoteRequest) => void;
}

function UpdateModal({
  id,
  isOpen,
  onClose,
  projectId,
  projectTitle,
  week,
  createdAt,
  isLoading,
  defaultValues,
  onSubmit,
}: UpdateModalProps) {
  const methods = useForm<UpdateProjectNoteRequest>({
    resolver: zodResolver(updateProjectNoteSchema),
    defaultValues: {
      id,
      projectId,
      title: projectTitle,
      week,
      date: dayjs(createdAt).format('YYYY-MM-DD'),
      description: '',
      img_url: null,
      ...defaultValues,
    },
  });

  return (
    <Modal
      size="md"
      className="rounded-2xl"
      isOpen={isOpen}
      onClose={onClose}
      hasCloseButton
    >
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
          <Button variant="solid" color="secondary">
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
          <Button
            variant="solid"
            color="primary"
            isSubmit
            isDisabled={isLoading}
          >
            發布
          </Button>
        </div>
      </Form>
    </Modal>
  );
}

export default UpdateModal;
