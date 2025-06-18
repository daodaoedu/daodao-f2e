import type { NextPage } from 'next';
import { useAuth, useAuthDispatch } from '@/contexts/Auth';
import { LandingPage } from './LandingPage';
import { PersonalDashboard } from './PersonalDashboard';

const NewHomePage: NextPage = () => {
  const { isLoggedIn } = useAuth();
  const authDispatch = useAuthDispatch();

  return (
    <>
      {/* Header 會透過 getBaseLayout 自動加入 */}
      {isLoggedIn ? (
        <PersonalDashboard />
      ) : (
        <LandingPage onLogin={() => authDispatch.openLoginModal()} />
      )}
      {/* Footer 也會透過 Layout 自動加入 */}
    </>
  );
};

export default NewHomePage;
