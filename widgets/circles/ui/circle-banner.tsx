'use client';

import { Image } from '@/shared/ui/image';
import { Title, Text } from '@/shared/ui/typography';
import { Container } from '@/shared/ui/wrapper';
import { AuthGuardButton } from '@/entities/user';
import groupBannerPng from '@/public/assets/circles/banner.png';

interface CircleBannerProps {
  onCreateClick?: () => void;
}

export const CircleBanner = ({ onCreateClick }: CircleBannerProps) => {
  return (
    <div className="relative">
      <Image
        src={groupBannerPng}
        alt="揪團封面"
        className="h-96 min-w-full bg-[linear-gradient(#fcfefe_10%,#e0f1f2_40%)] object-cover"
      />
      <Container className="absolute inset-0 z-10 flex flex-col items-center justify-center text-center text-basic-400">
        <Title as="h1" size="xl" className="mb-2">
          揪團
        </Title>
        <div className="mb-8">
          <Text size="sm" className="text-balance">
            想一起組織有趣的活動或學習小組嗎?
          </Text>
          <Text size="sm" className="text-balance">
            註冊並加入我們,然後創建你的活動,讓更多人一起參加!
          </Text>
        </div>
        <AuthGuardButton
          size="lg"
          onClick={onCreateClick}
        >
          我想揪團
        </AuthGuardButton>
      </Container>
    </div>
  );
};

