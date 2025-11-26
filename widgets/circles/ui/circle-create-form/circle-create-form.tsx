'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeftIcon } from 'lucide-react';
import SEOConfig from '@/components/SEOConfig';
import { Background, Container } from '@/shared/ui/wrapper';
import { Button } from '@/shared/ui/button';
import { CircleForm } from '@/features/circles/components/circle-form';
import {
  useAuth,
  getUserProfileBasePath,
  ProtectedComponent,
} from '@/entities/user';

interface CircleCreateFormProps {
  onClose?: () => void;
}

export const CircleCreateForm = ({ onClose }: CircleCreateFormProps) => {
  const router = useRouter();
  const { user } = useAuth();
  const basePath = getUserProfileBasePath(user);

  const handleSuccess = () => {
    if (onClose) {
      onClose();
    } else {
      router.replace(`${basePath}/circles`);
    }
  };

  const handleBack = () => {
    if (onClose) {
      onClose();
    } else {
      router.back();
    }
  };

  return (
    <ProtectedComponent>
      <Background className="min-h-screen text-basic-400">
        <SEOConfig title="發起揪團｜島島阿學" />
        <Container className="max-w-3xl space-y-6 pb-12">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBack}
            className="flex items-center gap-2"
          >
            <ArrowLeftIcon className="size-4" />
            返回
          </Button>
          <CircleForm onSuccess={handleSuccess} />
        </Container>
      </Background>
    </ProtectedComponent>
  );
};

