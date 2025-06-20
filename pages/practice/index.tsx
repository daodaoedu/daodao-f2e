import React, { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { Plus, AlertCircle } from 'lucide-react';

// 使用新的 hooks
import { usePracticeManager } from '@/features/practice/hooks';

// 組件
import PracticeCard from '@/features/practice/components/List/PracticeCard';
import LearningInsights from '@/features/practice/components/List/LearningInsights';
import DeleteConfirm from '@/features/practice/components/Edit/DeleteConfirm';

// 型別
import { Practice } from '@/services/practice/schema';
import { Button } from '@/components/ui/button';

const PracticeListPage: React.FC = () => {
  const router = useRouter();
  const {
    practices,
    stats,
    loading,
    error,
    deletePractice
  } = usePracticeManager();

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [practiceToDelete, setPracticeToDelete] = useState<Practice | null>(null);
  const [deleting, setDeleting] = useState(false);

  const handleCreateNew = () => {
    router.push('/practice/create');
  };

  const handlePracticeEdit = (practice: Practice) => {
    router.push(`/practice/${practice.id}/edit`);
  };

  const handlePracticeDelete = (practice: Practice) => {
    setPracticeToDelete(practice);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!practiceToDelete) return;

    setDeleting(true);
    try {
      await deletePractice(practiceToDelete.id);
      setDeleteConfirmOpen(false);
      setPracticeToDelete(null);
    } catch (err) {
      console.error('刪除失敗:', err);
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteConfirmOpen(false);
    setPracticeToDelete(null);
  };

  const handlePracticeCheckIn = (practice: Practice) => {
    router.push(`/practice/${practice.id}`);
  };

  const renderEmptyState = () => {
    if (practices.length === 0) {
      return (
        <div className="max-w-md mx-auto">
          <h3 className="text-lg font-semibold text-muted-foreground mb-2">尚未建立任何實踐</h3>
          <p className="text-base text-muted-foreground mb-6">開始你的第一個學習實踐吧！</p>
          <Button
            onClick={handleCreateNew}
            className="inline-flex items-center space-x-2"
          >
            <Plus className="h-5 w-5" />
            <span>建立第一個實踐</span>
          </Button>
        </div>
      );
    }

    return (
      <div className="max-w-md mx-auto">
        <h3 className="text-lg font-semibold text-muted-foreground mb-2">沒有找到符合條件的實踐</h3>
        <p className="text-base text-muted-foreground mb-4">請調整搜尋條件</p>
      </div>
    );
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-base" />
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-alert mx-auto mb-4" />
            <p className="text-basic-400 body-md">{error}</p>
          </div>
        </div>
      );
    }

    if (practices.length === 0) {
      return (
        <div className="text-center py-16">
          {renderEmptyState()}
        </div>
      );
    }

    return (
      <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {practices.map((practice: Practice) => (
          <PracticeCard
            key={practice.id}
            practice={practice}
            onEdit={handlePracticeEdit}
            onDelete={handlePracticeDelete}
            onCheckIn={handlePracticeCheckIn}
          />
        ))}
      </div>
    );
  };

  return (
    <>
      <Head>
        <title>主題實踐 - 學習進度追蹤</title>
        <meta name="description" content="追蹤你的學習進度，建立學習習慣" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <main>
        <div className="min-h-screen-without-padding-top bg-background">
          <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-8">
            <div className="mb-6 sm:mb-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 space-y-4 sm:space-y-0">
                <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
                  <h1 className="text-2xl font-bold text-foreground">主題實踐</h1>
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <span>總計: {stats.total}</span>
                    <span>進行中: {stats.active}</span>
                    <span className="hidden xs:inline">已完成: {stats.completed}</span>
                  </div>
                </div>

                <Button
                  onClick={handleCreateNew}
                  className="flex items-center justify-center space-x-2"
                >
                  <Plus className="h-4 w-4" />
                  <span className="hidden xs:inline">建立實踐</span>
                  <span className="xs:hidden">建立</span>
                </Button>
              </div>

            </div>

            {/* 學習洞察 */}
            <LearningInsights practices={practices} />

            <div>
              {renderContent()}
            </div>
          </div>
        </div>
      </main>

      <DeleteConfirm
        practice={practiceToDelete}
        isOpen={deleteConfirmOpen}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
        loading={deleting}
      />
    </>
  );
};

export default PracticeListPage;
