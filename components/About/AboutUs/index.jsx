import React from 'react';

import { Title, Text } from '@/components/ui/typography';

const AboutUs = () => (
  <section>
    <Title
      as="h1"
      size="xl"
      className="my-2.5"
    >
      關於我們
    </Title>
    <div
      className="my-5 flex items-center justify-center"
    >
      <img src="https://i.imgur.com/1nhGPPR.png" width="100%" alt="daodao" />
    </div>
    <div className="flex flex-col">
      <Text className="my-1.5">
        在島島阿學裡，每個人都是一座獨一無二的「島」，對於學習／生命擁有不同的渴望與資源，因為互相、互助學習，成為一片獨立又連結的群島。
      </Text>
      <Text className="my-1.5">
        而島島阿學也希望能有台語「沓沓仔學Ta̍uh-ta̍uh-á
        o̍h」，「慢慢學不用急」之意涵，道出組織的教育價值觀是以人為本，尊重每人學習步調與方向。
      </Text>
      <Text className="my-1.5">
        ｜島島阿學｜學習資源平台由一群學生、老師、家長共創。
        <Text className="font-bold">
          我們期盼以集體智慧，打造沒有天花板的學習環境，一個以自主學習為主的民主社群。
        </Text>
        邀請所有學習者一同解決彼此在學習時遇到的困境，例如找不到學習目標、合適資源、學習夥伴等問題。因此平台提供資源分享與整合，以及社群的服務，包含各領域各種形式的資源、教育活動、學習場域、學習經驗等等。我們認為社群即資源、支援，讓學習者在民主教育的社群中，以共好的概念，解決彼此學習的問題，支持彼此成為自己想成為的人。
      </Text>
    </div>
  </section>
);

export default AboutUs;
