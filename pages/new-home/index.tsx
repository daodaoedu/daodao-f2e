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
        title="島島阿學學習社群"
        description="台灣多元教育與學習資源平台"
        keywords="島島阿學,學習,教育,社群,資源"
        author="島島阿學"
        copyright="島島阿學"
        imgLink="https://www.daoedu.tw/preview.webp"
      />

      {/* Header  getBaseLayout */}
      {isLoggedIn ? (
        <PersonalDashboard />
      ) : (
        <LandingPage onLogin={() => authDispatch.openLoginModal()} />
      )}
      {/* Footer Layout */}
    </>
  );
};

export default NewHomePage;
