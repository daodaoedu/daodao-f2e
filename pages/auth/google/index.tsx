import { useLayoutEffect } from 'react';
import { redirectToAuth } from '@/contexts/Auth';

function AuthCallbackPage() {
  useLayoutEffect(() => {
    redirectToAuth();
  }, []);

  return null;
}

AuthCallbackPage.getLayout = (page: React.ReactNode) => page;

export default AuthCallbackPage;
