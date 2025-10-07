'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Check } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/shared/ui/button';
import { Form } from '@/shared/ui/form';
import DocSvg from '@/public/assets/icons/doc.svg';
import { Background, Container, Paper } from '@/shared/ui/wrapper';
import { BackButton } from '@/shared/ui/back-button';
import { Title } from '@/shared/ui/typography';
import { Progress } from '@/shared/ui/progress';
import {
  ResourceReviewFormSchema,
  resourceReviewFormSchema,
} from '@/services/resources/reviews/schema';
import ResourceReviewFields from './ResourceReviewFields';
import { useCreateResourceReview, useUpdateResourceReview } from '../hooks';

interface ResourceReviewFormProps {
  resourceId: string | null;
  reviewId?: number | null;
  onSuccess?: () => void;
}

export default function ResourceReviewForm({
  resourceId,
  reviewId,
  onSuccess,
}: ResourceReviewFormProps) {
  const { trigger: createResourceReview, isMutating: isCreating } = useCreateResourceReview(resourceId, {
    onSuccess: () => {
      toast.success('資源心得分享成功！');
      onSuccess?.();
    },
  });

  const { trigger: updateResourceReview, isMutating: isUpdating } = useUpdateResourceReview(resourceId, reviewId, {
    onSuccess: () => {
      toast.success('資源心得更新成功！');
      onSuccess?.();
    },
  });

  const isSubmitting = isCreating || isUpdating;

  const form = useForm<ResourceReviewFormSchema>({
    resolver: zodResolver(resourceReviewFormSchema),
    defaultValues: {
      content: '',
      overallImpact: 0,
      changeMindset: 0,
      solveProblems: 0,
      gainPerspectives: 0,
      achieveGoals: 0,
      timeUsage: '',
      contentFeatures: {
        wellStructured: false,
        practiceFocused: false,
        wellRoundedConcepts: false,
        thoughtProvoking: false,
        progressiveLearning: false,
        problemBased: false,
        realWorldExamples: false,
        interactive: false,
        visuallyRich: false,
      },
      resourceUsage: {
        withOtherTools: false,
        withCommunity: false,
        withOnlineCourses: false,
        withBooks: false,
        onlyThisResource: false,
        notApplicableResource: false,
      },
    },
  });

  const onSubmit = async (formData: ResourceReviewFormSchema) => {
    try {
      if (reviewId) {
        await updateResourceReview(formData);
      } else {
        await createResourceReview(formData);
      }
    } catch (error) {
      console.error('提交資源心得時發生錯誤:', error);
      toast.error('提交失敗，請稍後再試');
    }
  };

  return (
    <Background>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-10">
          <Container>
            <BackButton label="返回" />

            <Title as="h1" size="xl" className="mb-10 mt-3">
              分享心得
            </Title>

            <Paper>
              <ResourceReviewFields />
            </Paper>
          </Container>
          <footer className="sticky bottom-0 z-10 bg-basic-white py-4 shadow-2xl shadow-basic-300">
            <Container className="flex items-center justify-end gap-10">
              <div className="body-md flex flex-1 flex-col space-y-3">
                <div>心得</div>
                <Progress value={1} />
                <div className="body-sm">就快完成了</div>
              </div>
              <div className="flex shrink-0 gap-3">
                {typeof reviewId !== 'number' && (
                  <Button
                    variant="outline"
                    type="button"
                    size="lg"
                    disabled={isSubmitting}
                  >
                    <DocSvg className="size-4" />
                    儲存草稿
                  </Button>
                )}
                <Button size="lg" type="submit" disabled={isSubmitting}>
                  <Check size={16} />
                  {isSubmitting ? '處理中...' : '完成'}
                </Button>
              </div>
            </Container>
          </footer>
        </form>
      </Form>
    </Background>
  );
}
