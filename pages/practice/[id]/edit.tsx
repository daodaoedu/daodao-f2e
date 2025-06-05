// 編輯實踐頁面
import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { ArrowLeft } from 'lucide-react';
import { usePracticeDetail, usePracticeManager } from '@/features/practice/hooks';
import EditForm from '@/features/practice/components/Edit/EditForm';
import { MotivationType, ReminderFrequency, UpdatePracticeInput, Practice } from '@/features/practice';
import { Button } from '@/components/atoms/button';

const EditPracticePage: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;

  // 使用自製 hooks 取代 context
  const { practice, loading, error } = usePracticeDetail(id as string);
  const { updatePractice } = usePracticeManager();

  // 表單狀態管理
  const [formData, setFormData] = useState<Partial<Practice>>({});
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // 當 practice 載入完成時初始化表單資料
  useEffect(() => {
    if (practice) {
      setFormData({
        title: practice.title,
        description: practice.description,
        totalAmount: practice.totalAmount,
        targetDate: practice.targetDate,
        motivationType: practice.motivationType,
        customMotivation: practice.customMotivation,
        reminderEnabled: practice.reminderEnabled,
        reminderFrequency: practice.reminderFrequency,
        smallGoals: practice.smallGoals || [],
        resources: practice.resources || []
      });
    }
  }, [practice]);

  // 處理錯點導航
  useEffect(() => {
    if (router.asPath.includes('#') && practice) {
      const hash = router.asPath.split('#')[1];
      setTimeout(() => {
        const element = document.getElementById(hash);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100); // 稍微延遲以確保元素已渲染
    }
  }, [router.asPath, practice]);

  if (loading) {
    return (
      <div className="min-h-screen bg-primary-palest flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-base" />
      </div>
    );
  }

  if (error || !practice) {
    return (
      <div className="min-h-screen bg-primary-palest flex items-center justify-center">
        <div className="text-center">
          <h2 className="heading-lg text-basic-black mb-2">找不到實踐</h2>
          <p className="body-md text-basic-600 mb-4">該實踐可能已被刪除或不存在</p>
          <Button
            onClick={() => router.push('/practice')}
          >
            返回列表
          </Button>
        </div>
      </div>
    );
  }

  // 表單資料變更處理
  const handleFormChange = (updatedData: Partial<Practice>) => {
    setFormData(updatedData);
    // 清除相關錯誤
    setFormErrors({});
  };

  // 驗證表單資料
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.title?.trim()) {
      errors.title = '請輸入標題';
    }

    if (!formData.totalAmount || formData.totalAmount < 1) {
      errors.totalAmount = '請輸入有效的總量';
    }

    if (formData.targetDate) {
      const targetDate = new Date(formData.targetDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (targetDate < today) {
        errors.targetDate = '目標日期不能早於今天';
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      const updates: UpdatePracticeInput = {
        title: formData.title ?? '',
        description: formData.description ?? '',
        totalAmount: formData.totalAmount ?? 1,
        targetDate: formData.targetDate ?? '',
        motivationType: formData.motivationType ?? 'personal' as MotivationType,
        customMotivation: formData.customMotivation ?? '',
        reminderEnabled: formData.reminderEnabled ?? false,
        reminderFrequency: formData.reminderFrequency ?? 'daily' as ReminderFrequency,
        smallGoals: formData.smallGoals ?? [],
        resources: formData.resources ?? []
      };

      await updatePractice(practice!.id, updates);
      router.push(`/practice/${practice!.id}`);
    } catch (err) {
      console.error('更新失敗:', err);
      setFormErrors({ general: '儲存失敗，請稍後再試' });
    }
  };

  const handleCancel = () => {
    router.push(`/practice/${practice.id}`);
  };

  return (
    <>
      <Head>
        <title>編輯 {practice.title} - 主題實踐</title>
        <meta name="description" content={`編輯您的「${practice.title}」主題實踐`} />
      </Head>

      <div className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* 返回按鈕 */}
          <Button
            variant="ghost"
            onClick={handleCancel}
            className="flex items-center text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            <span>返回實踐詳情</span>
          </Button>

          {/* 編輯表單 */}
          <div className="bg-card rounded-lg shadow-sm border border-border overflow-hidden">
            <div className="p-6 border-b border-border">
              <h1 className="text-2xl font-bold text-foreground">編輯實踐</h1>
              <p className="text-sm text-muted-foreground mt-1">修改您的主題實踐設定</p>
            </div>

            <div className="p-6">
              <EditForm
                formData={formData}
                onChange={handleFormChange}
                errors={formErrors}
                practice={practice}
              />
              {formErrors.general && (
                <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                  <p className="body-sm text-destructive">{formErrors.general}</p>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-border bg-muted/50">
              <div className="flex justify-end space-x-3">
                <Button
                  variant="outline"
                  onClick={handleCancel}
                >
                  取消
                </Button>
                <Button
                  onClick={handleSave}
                >
                  儲存變更
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default EditPracticePage;
