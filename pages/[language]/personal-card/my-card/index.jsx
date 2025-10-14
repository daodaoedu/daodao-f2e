import React from 'react';
import dynamic from 'next/dynamic';
import { useSession } from '@/features/auth';

const PersonalCard = dynamic(() => import('@/components/PersonalCard'), {
  ssr: false,
});

const MyCardPage = () => {
  const { user } = useSession();

  return <PersonalCard {...user} isMe />;
};

export default MyCardPage;
