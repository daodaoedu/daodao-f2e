import { useMemo, useEffect, useState } from 'react';
import styled from '@emotion/styled';
import { useRouter } from 'next/router';
import { useSelector } from 'react-redux';

import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

import SEOConfig from '@/shared/components/SEO';
import Navigation from '@/shared/components/Navigation_v2';
import Footer from '@/shared/components/Footer_v2';

import StepperBar from '@/components/Marathon/SignUp/StepperBar';
import UserProfileForm from '@/components/Marathon/SignUp/UserProfileForm';
import MarathonForm from '@/components/Marathon/SignUp/MarathonForm';
import ConfirmForm from '@/components/Marathon/SignUp/ConfirmForm';
import { ProtectedComponent } from '@/contexts/Auth';
import { NavigationProvider } from '@/contexts/Navigation';

const HomePageWrapper = styled.div`
  --section-height: calc(100vh - 80px);
  --section-height-offset: 80px;
`;

const FormWrapper = styled.form`
  padding: 50px 0;

  @media (max-width: 767px) {
    padding: 20px 16px;
  }
`;

const ContentWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  border-radius: 16px;
  margin: 0 auto;
  width: 737px;
  max-width: 100%;

  @media (max-width: 767px) {
    width: 100%;
    .title {
      text-overflow: ellipsis;
      width: 100%;
    }
  }
`;
const LearningMarathonSignUp = () => {
  const router = useRouter();
  const SEOData = useMemo(
    () => ({
      title: '申請島島盃 - 2025 春季學習馬拉松｜多元學習資源平台｜島島阿學',
      description:
        '「島島阿學」盼能透過建立多元的學習資源網絡，讓自主學習者能找到合適的成長方法，進一步成為自己想成為的人，從中培養共好精神。目前正積極打造「可共編的學習資源平台」。',
      keywords: '島島阿學',
      author: '島島阿學',
      copyright: '島島阿學',
      imgLink: 'https://www.daoedu.tw/preview.webp',
      link: `${process.env.HOSTNAME}${router?.asPath}`,
      structuredData: [
        {
          '@context': 'https://schema.org',
          '@type': 'WebSite',
          url: 'https://www.daoedu.tw',
          potentialAction: {
            '@type': 'SearchAction',
            'query-input': 'required name=q',
            target: 'https://www.daoedu.tw/search?q={q}',
          },
        },
        {
          '@context': 'https://schema.org',
          '@type': 'Organization',
          url: 'https://www.daoedu.tw',
          logo: 'https://www.daoedu.tw/favicon-112.png',
        },
      ],
    }),
    [router?.asPath],
  );
  const [currentStep, setCurrentStep] = useState(0);
  const fromProfilePage = window.localStorage.getItem('fromProfilePage');
  const marathonState = useSelector((state) => { return state.marathon; });
  if (fromProfilePage && marathonState._id) {
    if (fromProfilePage === 'click_edit') {
      window.localStorage.removeItem('fromProfilePage');
      setCurrentStep(1);
    }
    if (fromProfilePage === 'click_detail') {
      window.localStorage.removeItem('fromProfilePage');
      setCurrentStep(2);
    }
  }
  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  }, [currentStep]);
  return (
    <>
      <NavigationProvider>
        <Navigation>
          {<StepperBar currentStep={currentStep} />}
        </Navigation>
      </NavigationProvider>
      <ProtectedComponent redirectOnCancel="/learning-marathon" onlyCheckToken>
        <SEOConfig data={SEOData} />
        <FormWrapper sx={{
          background: 'linear-gradient(0deg, #F3FCFC 0%, #F3FCFC 100%), #F7F8FA'
        }}
        >
          <LocalizationProvider
            dateAdapter={AdapterDayjs}
          >
            <ContentWrapper sx={{ minHeight: '100vh' }}>
              {
                currentStep === 0 ? (
                  <UserProfileForm currentStep={currentStep} setCurrentStep={setCurrentStep} />
                ) : currentStep === 1 ? (
                  <MarathonForm currentStep={currentStep} setCurrentStep={setCurrentStep} />
                ) : <ConfirmForm currentStep={currentStep} setCurrentStep={setCurrentStep} />
              }

            </ContentWrapper>
          </LocalizationProvider>
        </FormWrapper>
      </ProtectedComponent>
    </>
  );
};

LearningMarathonSignUp.getLayout = ({ children }) => {
  return (
    <HomePageWrapper>
      {children}
      <Footer />
    </HomePageWrapper>
  );
};

export default LearningMarathonSignUp;
