import React, { useEffect } from 'react';
import { getRedirectionStorage } from '@/utils/storage';
import NotExist from '@/shared/components/NotExist';

const NotExistPage = () => {
  useEffect(() => {
    getRedirectionStorage().remove();
  }, []);

  return <NotExist />;
};

export default NotExistPage;
