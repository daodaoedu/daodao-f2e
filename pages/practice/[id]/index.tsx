// 單一實踐詳情頁面
import React from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { usePracticeDetail } from '@/features/practice/hooks';
import DashboardFlow from '@/features/practice/components/Dashboard/DashboardFlow';
import { Button } from '@/components/atoms/button';

const PracticeDetailPage: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;

  // 使用自製 hook 取代 context
  const { practice, loading, error } = usePracticeDetail(id as string);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (error || !practice) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-2">找不到實踐</h2>
          <p className="text-base text-muted-foreground mb-4">該實踐可能已被刪除或不存在</p>
          <Button
            onClick={() => router.push('/practice')}
          >
            返回列表
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>{practice.title} - 主題實踐</title>
        <meta name="description" content={`查看和管理您的「${practice.title}」主題實踐`} />
      </Head>

      <DashboardFlow
        practice={practice}
        onBack={() => router.push('/practice')}
      />
    </>
  );
};

export default PracticeDetailPage;
