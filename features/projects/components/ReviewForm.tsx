import { format } from 'date-fns';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import PostCard from '@/shared/components/Post/PostCard';
import {
  projectReviewFormSchema,
  ProjectReviewFormSchema,
} from '@/services/projects';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { MarkdownEditor } from '@/components/ui/markdown-editor';
import numberToChineseNumber from '@/utils/numberToChineseNumber';
import { cn } from '@/utils/cn';

import RadioGroup from './ReviewRadioGroup';

interface ReviewFormProps {
  projectTitle: string;
  week: number;
  createdAt?: string;
  isLoading: boolean;
  defaultValues?: ProjectReviewFormSchema;
  onSubmit: (data: ProjectReviewFormSchema) => void;
}

function ReviewForm({
  projectTitle,
  week,
  createdAt,
  defaultValues,
  isLoading,
  onSubmit,
}: ReviewFormProps) {
  const methods = useForm({
    resolver: zodResolver(projectReviewFormSchema),
    defaultValues: {
      title: projectTitle,
      week,
      moodDescription: '',
      learningFeedback: '',
      adjustmentPlan: '',
      mood: '',
      learningReview: 0,
      stressLevel: 0,
      ...defaultValues,
    },
  });

  return (
    <Form {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)}>
        <PostCard className="p-0 md:p-0">
          <PostCard.Header
            title={methods.watch('title')}
            subtitle={`第${numberToChineseNumber(week)}週`}
            tag="覆盤"
            date={createdAt ? format(new Date(createdAt), 'yyyy/MM/dd') : format(new Date(), 'yyyy/MM/dd')}
            onTitleChange={(title) => methods.setValue('title', title || projectTitle)}
            isEditable
          />
          <div className="relative">
            <ul className="body-md ml-8 list-decimal font-normal marker:heading-sm">
              <li className="mb-8">
                <h3 className="heading-sm mb-4">這段時間的整體心情：</h3>
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
                    {...methods.register('moodDescription')}
                  />
                </div>
              </li>
              <li className="mb-8">
                <h3 className="heading-sm mb-4">壓力程度：</h3>
                <div className="-ml-6">
                  <RadioGroup
                    type="tenPoint"
                    name="stressLevel"
                    control={methods.control}
                  />
                </div>
              </li>
              <li className="mb-8">
                <h3 className="heading-sm mb-4">學習回顧：</h3>
                <div className="-ml-6">
                  <p className="mb-4">學習動力</p>
                  <div className="mb-4">
                    <RadioGroup
                      type="tenPoint"
                      name="learningReview"
                      control={methods.control}
                    />
                  </div>
                  <p className="mb-4">這段時間，我的收穫與困難...</p>
                  <MarkdownEditor
                    rootClassName="p-px mb-2 bg-basic-200 rounded-md"
                    className="rounded-md bg-white"
                    editorClassName="min-h-24"
                    ref={(element) => methods.register('learningFeedback').ref(element)}
                    value={methods.watch('learningFeedback')}
                    placeholder="例如: 有哪些收獲，包含學習、人際互動、身心狀況等，或是目前遇到的困難"
                    onChange={(markdown) => methods.setValue('learningFeedback', markdown)}
                  />
                </div>
              </li>
              <li>
                <h3 className="heading-sm mb-4">調整與規劃：</h3>
                <div className="-ml-6">
                  <p className="mb-4">為了更好的學習狀態，我會...</p>
                  <MarkdownEditor
                    rootClassName="p-px mb-2 bg-basic-200 rounded-md"
                    className="rounded-md bg-white"
                    editorClassName="min-h-24"
                    ref={(element) => methods.register('adjustmentPlan').ref(element)}
                    value={methods.watch('adjustmentPlan')}
                    placeholder="例如：打算如何克服目前的挑戰，例如在身心、學習環境、方法、資源方面 ，希望獲得何種支持"
                    onChange={(markdown) => methods.setValue('adjustmentPlan', markdown)}
                  />
                </div>
              </li>
            </ul>
          </div>
          <div className="flex justify-end gap-5 pt-5">
            <Button variant="default" type="submit" disabled={isLoading}>
              發布覆盤
            </Button>
          </div>
        </PostCard>
      </form>
    </Form>
  );
}

export default ReviewForm;
