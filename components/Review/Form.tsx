import toast from 'react-hot-toast';
import dayjs from 'dayjs';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import PostCard from '@/shared/components/Post/PostCard';
import {
  CreateProjectReviewRequest,
  createProjectReviewSchema,
  UpdateProjectReviewRequest,
  updateProjectReviewSchema,
} from '@/services/project/reviews';
import Button from '@/shared/components/Button';
import Form from '@/shared/components/Form';
import numberToChineseNumber from '@/utils/numberToChineseNumber';
import { cn } from '@/utils/cn';

import RadioGroup from './RadioGroup';

interface BaseReviewFormProps {
  projectId: string;
  projectTitle: string;
  week: number;
  createdAt?: string;
  isLoading: boolean;
  defaultValues?: UpdateProjectReviewRequest;
}

type ReviewFormProps = BaseReviewFormProps &
  (
    | { id: number; onSubmit: (data: UpdateProjectReviewRequest) => void }
    | { id?: never; onSubmit: (data: CreateProjectReviewRequest) => void }
  );

function ReviewForm({
  id,
  projectId,
  projectTitle,
  week,
  createdAt,
  defaultValues,
  isLoading,
  onSubmit,
}: ReviewFormProps) {
  const methods = useForm<
    typeof id extends never
      ? CreateProjectReviewRequest
      : UpdateProjectReviewRequest
  >({
    resolver: zodResolver(
      id ? updateProjectReviewSchema : createProjectReviewSchema
    ),
    defaultValues: {
      id,
      projectId,
      title: projectTitle,
      week,
      mood_description: '',
      learning_feedback: '',
      adjustment_plan: '',
      ...defaultValues,
    },
  });

  return (
    <Form methods={methods} onSubmit={onSubmit}>
      <PostCard className="p-0 md:p-0">
        <PostCard.Header
          title={methods.watch('title')}
          subtitle={`第${numberToChineseNumber(week)}週`}
          tag="覆盤二"
          date={dayjs(createdAt).format('YYYY/MM/DD')}
          onTitleChange={(title) =>
            methods.setValue('title', title || projectTitle)
          }
          isEditable
        />
        <div className="relative max-h-96 overflow-y-auto">
          <ul className="ml-8 list-decimal marker:heading-sm body-md font-normal">
            <li className="mb-8">
              <h3 className="mb-4 heading-sm">這段時間的整體心情：</h3>
              <div className="-ml-6">
                <div className="mb-4">
                  <RadioGroup
                    type="emoji"
                    name="mood"
                    control={methods.control}
                  />
                </div>
                <p className="mb-2">其他</p>
                <input
                  type="text"
                  placeholder="其他"
                  className={cn(
                    'w-full px-4 py-2 resize-none body-sm',
                    'border border-solid border-basic-200 rounded-lg'
                  )}
                  {...methods.register('mood_description')}
                />
              </div>
            </li>
            <li className="mb-8">
              <h3 className="mb-4 heading-sm">壓力程度：</h3>
              <div className="-ml-6">
                <RadioGroup
                  type="tenPoint"
                  name="stress_level"
                  control={methods.control}
                />
              </div>
            </li>
            <li className="mb-8">
              <h3 className="mb-4 heading-sm">學習回顧：</h3>
              <div className="-ml-6">
                <p className="mb-4">學習動力</p>
                <div className="mb-4">
                  <RadioGroup
                    type="tenPoint"
                    name="learning_review"
                    control={methods.control}
                  />
                </div>
                <p className="mb-4">這段時間，我的收穫與困難...</p>
                <textarea
                  placeholder="例如: 有哪些收獲，包含學習、人際互動、身心狀況等，或是目前遇到的困難"
                  className={cn(
                    'w-full h-24 px-4 py-3 resize-none body-sm',
                    'border border-solid border-basic-200 rounded-lg'
                  )}
                  {...methods.register('learning_feedback')}
                />
              </div>
            </li>
            <li>
              <h3 className="mb-4 heading-sm">調整與規劃：</h3>
              <div className="-ml-6">
                <p className="mb-4">為了更好的學習狀態，我會...</p>
                <textarea
                  placeholder="例如：打算如何克服目前的挑戰，例如在身心、學習環境、方法、資源方面 ，希望獲得何種支持"
                  className={cn(
                    'w-full h-24 px-4 py-3 resize-none body-sm',
                    'border border-solid border-basic-200 rounded-lg'
                  )}
                  {...methods.register('adjustment_plan')}
                />
              </div>
            </li>
          </ul>
        </div>
        <div className="pt-5 flex justify-end gap-5">
          <Button
            color="primary"
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
            發布覆盤
          </Button>
        </div>
      </PostCard>
    </Form>
  );
}

export default ReviewForm;
