import React from 'react';
import dynamic from 'next/dynamic';
import { useAuth } from '@/contexts/Auth';

const PersonalCard = dynamic(() => import('@/components/PersonalCard'), {
  ssr: false,
});

const MyCardPage = () => {
  const { user } = useAuth();

  return <PersonalCard {...user} isMe />;
};

export default MyCardPage;
