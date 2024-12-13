import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Navigation from '@/shared/components/Navigation_v2';
import Footer from '@/shared/components/Footer_v2';
import { HomePageWrapper } from '@/components/Signin/Signin.styled';
import useProfileValidation from '@/components/Signin/useValidation';
import { useAuth, useAuthDispatch } from '@/contexts/Auth';
import Step1 from '@/components/Signin/Step1';
import Step2 from '@/components/Signin/Step2';
import TipModal from '@/components/Signin/Interest/TipModal';

function SignInPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [open, setOpen] = useState(false);
  const { errors, onChangeHandler, userState, validateFields } =
    useProfileValidation();

  const { isLoggedIn, token } = useAuth();
  const { updateUser } = useAuthDispatch();

  const handleSubmit = async () => {
    if (validateFields(userState, true)) {
      const payload = {
        ...userState,
        isSendEmail: true,
        birthDay: userState.birthDay.toISOString(),
      };
      try {
        await updateUser(payload);
      } catch (error) {
        console.error(error);
      }
    }
  };

  useEffect(() => {
    if (isLoggedIn) {
      setOpen(true);
    } else if (!token) {
      router.push('/');
    }
  }, [isLoggedIn, token]);

  return (
    <>
      {step === 1 && (
        <Step1
          errors={errors}
          onChangeHandler={onChangeHandler}
          userState={userState}
          onNext={() => {
            if (validateFields(userState, true)) {
              setStep(2);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }
          }}
        />
      )}
      {step === 2 && (
        <Step2
          onChangeHandler={onChangeHandler}
          userState={userState}
          onBack={() => {
            setStep(1);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onNext={handleSubmit}
        />
      )}
      <TipModal
        open={open}
        onClose={() => {
          setOpen(false);
          router.replace('/');
        }}
        onOk={() => {
          setOpen(false);
          router.replace('/profile');
        }}
      />
    </>
  );
}

SignInPage.getLayout = ({ children }) => {
  return (
    <HomePageWrapper>
      <Navigation />
      {children}
      <Footer />
    </HomePageWrapper>
  );
};

export default SignInPage;
