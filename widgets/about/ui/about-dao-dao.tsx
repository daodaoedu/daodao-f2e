import React from 'react';
import { Title, Text } from '@/shared/ui/typography';
import { Image } from '@/shared/ui/image';
import { ANCHOR_IDS } from '@/shared/constants';

export const AboutDaoDao = () => (
  <section id={ANCHOR_IDS.ABOUT_DAO_DAO}>
    <Title as="h1" size="xl">
      關於島島
    </Title>
    <div className="relative my-5 aspect-[944/358]">
      <Image
        src="https://i.imgur.com/1nhGPPR.png"
        alt="daodao"
        fill
        className="object-cover"
      />
    </div>
    <div className="flex flex-col">
      <Text className="my-1.5 text-lg leading-relaxed">
        島島阿學是為「相信學習可以不一樣的人」所打造的學習平台。
      </Text>
      <Text className="my-1.5 text-lg leading-relaxed">
        以科技與社群，匯集學習經驗、資源、人脈，並提供個人化學習管理與技能展現的工具，賦予每個人掌握學習旅程的能力。
      </Text>
      <Text className="my-1.5 text-lg leading-relaxed">
        這裡，是個人成長與集體智慧交會的所在。
      </Text>
      <Text className="my-1.5 text-center font-medium italic text-gray-600">
        Where personal growth meets collective wisdom.
      </Text>
    </div>
  </section>
);
