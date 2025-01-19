import React from 'react';
import { useAuth } from '@/contexts/Auth';
import PersonalCard from '@/components/PersonalCard';

const MyCardPage = () => {
  const { user } = useAuth();

  return <PersonalCard {...user} isMe />;
};

export default MyCardPage;
