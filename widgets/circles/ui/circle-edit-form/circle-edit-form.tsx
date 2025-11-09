'use client';

import { ArrowLeftIcon } from 'lucide-react';
import SEOConfig from '@/components/SEOConfig';
import { Background, Container } from '@/shared/ui/wrapper';
import { Button } from '@/shared/ui/button';
import { CircleForm } from '@/features/circles/components/circle-form';
import type { CircleData } from '@/entities/circle';
import { ProtectedComponent } from '@/entities/user';

interface CircleEditFormProps {
  data: CircleData;
  onClose: () => void;
}

export const CircleEditForm = ({ data, onClose }: CircleEditFormProps) => {
  const handleSuccess = () => {
    onClose();
  };

  return (
    <ProtectedComponent>
      <Background className="min-h-screen text-basic-400">
        <SEOConfig title={`${data?.title} - 編輯揪團｜島島阿學`} />
        <Container className="max-w-3xl space-y-6 pb-12">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="flex items-center gap-2"
          >
            <ArrowLeftIcon className="size-4" />
            返回
          </Button>
          <CircleForm values={data} onSuccess={handleSuccess} />
        </Container>
      </Background>
    </ProtectedComponent>
  );
};

