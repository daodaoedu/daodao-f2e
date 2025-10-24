'use client';

import { useParams, useRouter } from 'next/navigation';
import { usePractice } from '@/services/practice/hooks';
import { useSession } from '@/entities/session/model/context';
import DashboardFlow from '@/features/practice/components/Dashboard/DashboardFlow';
import { Button } from '@/shared/ui/button';
import { ArrowLeft } from 'lucide-react';

const PracticeDetailPage = () => {
  const router = useRouter();
  const params = useParams();
  const practiceId = params?.practiceId as string;
  const { user } = useSession();

  const { practice, isLoading, error, mutate } = usePractice(practiceId || null);

  if (!practiceId) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-primary-palest flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-base" />
      </div>
    );
  }

  if (error || !practice) {
    return (
      <div className="min-h-screen bg-primary-palest flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-md p-6 w-full max-w-3xl text-center">
          <h1 className="text-xl font-bold mb-4">找不到主題實踐</h1>
          <p className="text-base text-muted-foreground mb-4">該主題實踐可能已被刪除或不存在</p>
          <Button onClick={() => router.push('/explore')} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            返回探索頁面
          </Button>
        </div>
      </div>
    );
  }

  return (
    <DashboardFlow
      practice={practice}
      currentUserId={user?.id}
      onBack={() => router.back()}
      onDataUpdate={() => mutate()}
    />
  );
};

export default PracticeDetailPage;
