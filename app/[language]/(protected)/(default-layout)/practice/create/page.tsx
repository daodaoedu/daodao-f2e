'use client';

import { useRouter } from 'next/navigation';
import SetupFlow from '@/features/practice/components/Setup/SetupFlow';

export default function CreatePracticePage() {
  const router = useRouter();

  const handleComplete = (practiceId: string) => {
    // 建立完成後跳轉到該實踐的儀表板
    router.push(`/practice/${practiceId}`);
  };

  const handleCancel = () => {
    // 取消建立,返回探索頁面
    router.push('/explore');
  };

  return (
    <SetupFlow onComplete={handleComplete} onCancel={handleCancel} />
  );
}
