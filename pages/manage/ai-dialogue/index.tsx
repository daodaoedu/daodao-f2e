import React from 'react';
import { NextPage } from 'next';
import { DialogueProvider } from '@/components/Dialogue/DialogueContext';
import DialogueGuide from '@/components/Dialogue/DialogueGuide';
import GoBackButton from '@/components/Projects/GoBackButton';
import { useRouter } from 'next/router';
import { MdChevronLeft } from 'react-icons/md';

const AIDialoguePage: NextPage = () => {
  const router = useRouter();

  const handleGoBack = () => {
    router.push('/manage');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center mb-6">
        <GoBackButton
          id="go-back"
          buttonText="返回"
          icon={<MdChevronLeft className="mr-1 text-basic-400 group-hover:text-primary-base" />}
          onClick={handleGoBack}
        />
        <h1 className="text-2xl font-bold ml-4">AI 對話引導系統</h1>
      </div>

      <DialogueProvider>
        <DialogueGuide />
      </DialogueProvider>
    </div>
  );
};

export default AIDialoguePage;
