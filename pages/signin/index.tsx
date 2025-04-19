import { useState } from 'react';
import { useRouter } from 'next/router';
import toast from 'react-hot-toast';
import useProfileValidation from '@/components/Signin/useValidation';
import { ProtectedComponent, useAuthDispatch } from '@/contexts/Auth';
import Step1 from '@/components/Signin/Step1';
import Step2 from '@/components/Signin/Step2';
import TipModal from '@/components/Signin/TipModal';

function SignInPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [open, setOpen] = useState(false);
  const { errors, onChangeHandler, userState, validateFields } =
    useProfileValidation();

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
        setOpen(true);
      } catch {
        toast.error('伺服器異常，請稍後再試');
      }
    }
  };

  return (
    <ProtectedComponent onlyCheckToken redirectOnCancel="/">
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
        isOpen={open}
        onClose={() => {
          setOpen(false);
          router.replace('/');
        }}
        onOk={() => {
          setOpen(false);
          router.replace('/personal-card');
        }}
      />
    </ProtectedComponent>
  );
}

export default SignInPage;
