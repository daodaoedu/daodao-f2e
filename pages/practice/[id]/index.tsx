// 單一實踐詳情頁面
import React from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { PracticeProvider, usePractice } from '../../../contexts/PracticeContext';
import DashboardFlow from '../../../components/Practice/Dashboard/DashboardFlow';

const PracticeDetailContent: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  const { getPractice } = usePractice();

  const practice = getPractice(id as string);

  if (!practice) {
    return (
      <div className="min-h-screen bg-primary-palest flex items-center justify-center">
        <div className="text-center">
          <h2 className="heading-lg text-basic-black mb-2">找不到實踐</h2>
          <p className="body-md text-basic-600 mb-4">該實踐可能已被刪除或不存在</p>
          <button
            type="button"
            onClick={() => router.push('/practice')}
            className="px-4 py-2 bg-primary-base text-white rounded-lg hover:bg-primary-darker transition-colors"
          >
            返回列表
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>{practice.title} - 主題實踐</title>
        <meta name="description" content={`查看和管理您的「${practice.title}」學習實踐`} />
      </Head>

      <DashboardFlow
        practice={practice}
        onBack={() => router.push('/practice')}
      />
    </>
  );
};

const PracticeDetailPage: React.FC = () => {
  return (
    <PracticeProvider>
      <PracticeDetailContent />
    </PracticeProvider>
  );
};

export default PracticeDetailPage;
