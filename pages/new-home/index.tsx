import type { NextPage } from 'next';
import { useAuth, useAuthDispatch } from '@/contexts/Auth';
import SEOConfig from '@/shared/components/SEO';
import { LandingPage } from '@/features/home/LandingPage';
import { PersonalDashboard } from '@/features/home/PersonalDashboard';

const NewHomePage: NextPage = () => {
  const { isLoggedIn } = useAuth();
  const authDispatch = useAuthDispatch();

  return (
    <>
      <SEOConfig
        title="Cx�ǐs�\��?x"
        description="�x��E�|���/���2e��}�8"
        keywords="��?x,x�s�,�;x�,x�ǐ"
        author="��?x"
        copyright="��?x"
        imgLink="https://www.daoedu.tw/preview.webp"
      />

      {/* Header N getBaseLayout �ՠe */}
      {isLoggedIn ? (
        <PersonalDashboard />
      ) : (
        <LandingPage onLogin={() => authDispatch.openLoginModal()} />
      )}
      {/* Footer _N Layout �ՠe */}
    </>
  );
};

export default NewHomePage;
