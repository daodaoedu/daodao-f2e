import React from 'react';
import { useAuth } from '@/contexts/Auth';
import Profile from '@/components/Profile';

const MyProfilePage = () => {
  const { user } = useAuth();

  return <Profile {...user} isMe />;
};

export default MyProfilePage;
