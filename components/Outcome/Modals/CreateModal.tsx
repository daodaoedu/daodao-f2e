import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import dayjs from 'dayjs';
import Modal from '@/shared/components/Modal';
import PostCard from '@/shared/components/Post/PostCard';
import Button from '@/shared/components/Button';
import Form from '@/shared/components/Form';
import {
  CreateProjectOutcomeRequest,
  createProjectOutcomeSchema,
} from '@/services/project/outcomes';
import numberToChineseNumber from '@/utils/numberToChineseNumber';

interface CreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  projectTitle: string;
  week: number;
  isLoading: boolean;
  onSubmit: (data: CreateProjectOutcomeRequest) => void;
}

function CreateModal({
  isOpen,
  onClose,
  projectId,
  projectTitle,
  week,
  isLoading,
  onSubmit,
}: CreateModalProps) {
  const methods = useForm<CreateProjectOutcomeRequest>({
    resolver: zodResolver(createProjectOutcomeSchema),
    defaultValues: {
      projectId,
      title: projectTitle,
      date: dayjs().format('YYYY-MM-DD'),
      week,
      description: '',
      img_url: null,
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
            tag="成果"
            date={dayjs().format('YYYY/MM/DD')}
            onTitleChange={(title) =>
              methods.setValue('title', title || projectTitle)
            }
            isEditable
          />
        </PostCard>
        <textarea
          className="w-full h-80 px-2 py-1 body-sm focus-within:outline-none resize-none"
          placeholder="學習成果的提示文字
例如：你的成果包含哪些內容？
可以分享簡報、PDF檔案的連結，也可以分享影片連結，分享時記得設為公開喔～"
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

export default CreateModal;
