// 建立新實踐頁面
import React from 'react';
import Head from 'next/head';
import { useRouter } from 'next/navigation';
import SetupFlow from '@/features/practice/components/Setup/SetupFlow';

const CreatePracticePage: React.FC = () => {
  const router = useRouter();

  const handleComplete = (practiceId: string) => {
    // 建立完成後跳轉到該實踐的儀表板
    router.push(`/practice/${practiceId}`);
  };

  const handleCancel = () => {
    // 取消建立，返回列表
    router.push('/practice');
  };

  return (
    <>
      <Head>
        <title>建立新實踐 - 主題實踐</title>
        <meta name="description" content="建立你的學習實踐計劃" />
      </Head>

      <SetupFlow
        onComplete={handleComplete}
        onCancel={handleCancel}
      />
    </>
  );
};

export default CreatePracticePage;
