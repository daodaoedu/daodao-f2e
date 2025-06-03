// 編輯實踐頁面
import React from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { ArrowLeft } from 'lucide-react';
import { usePracticeDetail } from '@/features/practice/hooks';
import { usePractices } from '@/services/modules/practice/hooks';
import EditForm from '@/features/practice/components/Edit/EditForm';
import { MotivationType, ReminderFrequency, UpdatePracticeInput } from '@/services/modules/practice';
import { Button } from '@/components/atoms/button';

const EditPracticePage: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;

  // 使用自製 hooks 取代 context
  const { practice, loading, error } = usePracticeDetail(id as string);
  const { updatePractice } = usePractices();

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

  const handleSave = async (updates: UpdatePracticeInput) => {
    try {
      await updatePractice(practice.id, updates);
      router.push(`/practice/${practice.id}`);
    } catch (err) {
      console.error('更新失敗:', err);
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
                formData={{
                  title: practice.title,
                  description: practice.description,
                  totalAmount: practice.totalAmount,
                  targetDate: practice.targetDate,
                  motivationType: practice.motivationType,
                  customMotivation: practice.customMotivation,
                  reminderEnabled: practice.reminderEnabled,
                  reminderFrequency: practice.reminderFrequency,
                  smallGoals: practice.smallGoals,
                  resources: practice.resources
                }}
                onChange={() => {
                  // 這裡可以添加即時預覽功能
                }}
                errors={{}}
                practice={practice}
              />
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
                  onClick={() => {
                    handleSave({
                      title: practice.title ?? '',
                      description: practice.description ?? '',
                      totalAmount: practice.totalAmount ?? 1,
                      targetDate: practice.targetDate ?? '',
                      motivationType: practice.motivationType ?? 'personal' as MotivationType,
                      customMotivation: practice.customMotivation ?? '',
                      reminderEnabled: practice.reminderEnabled ?? false,
                      reminderFrequency: practice.reminderFrequency ?? 'daily' as ReminderFrequency,
                      smallGoals: practice.smallGoals ?? [],
                      resources: practice.resources ?? []
                    });
                  }}
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
