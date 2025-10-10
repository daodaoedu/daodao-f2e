'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { usePractice } from '@/services/practice/hooks';
import { practiceAPI } from '@/services/practice/api';
import { Practice, UpdatePracticeInput } from '@/services/practice/schema';
import EditForm from '@/features/practice/components/Edit/EditForm';
import { Button } from '@/shared/ui/button';
import { ArrowLeft, Save } from 'lucide-react';

const PracticeEditPage = () => {
  const router = useRouter();
  const params = useParams();
  const practiceId = params?.practiceId as string;

  const { practice, isLoading, error, mutate } = usePractice(practiceId || null);
  const [formData, setFormData] = useState<Partial<Practice>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize formData when practice is loaded
  useEffect(() => {
    if (practice && !isInitialized) {
      setFormData(practice);
      setIsInitialized(true);
    }
  }, [practice, isInitialized]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title?.trim()) {
      newErrors.title = '請輸入標題';
    } else if (formData.title.length > 100) {
      newErrors.title = '標題不能超過100個字元';
    }

    if (!formData.totalAmount || formData.totalAmount < 1) {
      newErrors.totalAmount = '請輸入有效的總量';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm() || !practice) {
      toast.error('請檢查表單內容');
      return;
    }

    setIsSaving(true);
    try {
      const updateInput: UpdatePracticeInput = {
        title: formData.title,
        totalAmount: formData.totalAmount,
        tags: formData.tags,
        practiceAction: formData.practiceAction,
        resources: formData.resources,
        dailyGoal: formData.dailyGoal,
      };

      await practiceAPI.update(practiceId, updateInput);
      await mutate(); // Revalidate the practice data

      toast.success('儲存成功');
      router.push(`/practice/${practiceId}`);
    } catch (err) {
      console.error('Save error:', err);
      toast.error('儲存失敗，請稍後再試');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    router.push(`/practice/${practiceId}`);
  };

  if (!practiceId) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-basic-white pt-20 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-base" />
      </div>
    );
  }

  if (error || !practice) {
    return (
      <div className="min-h-screen bg-basic-white pt-20 flex items-center justify-center">
        <div className="bg-white rounded-lg border border-basic-200 shadow-sm p-6 w-full max-w-2xl text-center">
          <h1 className="text-xl font-bold mb-4 text-basic-600">找不到主題實踐</h1>
          <p className="text-base text-basic-400 mb-4">該主題實踐可能已被刪除或不存在</p>
          <Button onClick={() => router.push('/explore')} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            返回探索頁面
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-basic-white pt-20">
      <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="overflow-visible rounded-lg border border-basic-200 bg-white shadow-sm">
          {/* 頁面標題 */}
          <div className="p-6">
            <div className="mb-2 flex items-center">
              <div className="mr-2 size-2 rounded-full bg-primary-base" />
              <span className="body-sm text-basic-400">主題實踐</span>
            </div>
            <h3 className="heading-lg text-basic-600">編輯實踐</h3>
            <p className="body-sm mt-1 text-basic-400">
              修改你的實踐設定
            </p>
          </div>

          {/* Edit Form */}
          <div className="px-6 pb-6">
            {isInitialized ? (
              <EditForm
                formData={formData}
                onChange={setFormData}
                errors={errors}
                practice={practice}
              />
            ) : (
              <div className="py-8 text-center text-basic-400">
                載入表單資料中...
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between gap-4 border-t border-basic-200 bg-basic-50 px-6 py-4">
            <Button
              variant="ghost"
              onClick={handleCancel}
              disabled={isSaving}
              className="text-basic-500 hover:text-basic-600"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              取消
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="min-w-[120px]"
            >
              {isSaving ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  儲存中...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  儲存變更
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PracticeEditPage;
