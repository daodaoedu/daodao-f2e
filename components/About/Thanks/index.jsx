import React from 'react';
import { Title, Text } from '@/components/ui/typography';

const Thanks = () => (
  <section className="my-5">
    <Title
      as="h2"
      size="lg"
      className="mb-2.5 mt-10"
    >
      感謝名單
    </Title>
    <div className="m-5 flex flex-col gap-2">
      <Text className="my-1.5 font-medium">
        「島島阿學－學習資源平台」是從一個人到一群人，並透過自學從無到有的過程。
        這一路上，感謝每一位曾經參與其中的夥伴，論是針對組織、平台給予建議，又或者協助新增資源，都讓我們由衷的感謝，島島阿學是在每一位橋樑互助共好下誕生的。
      </Text>
      <Text className="my-1.5">
        臺灣實驗教育推動中心, 唐光華 老師, 丁志仁 老師, 曲智鑛 老師,
        g0v零時小學校, 柯君翰, 高婷柔, 向恩霈, 詹喬智, 米苔目, 王玠堯, Ael
      </Text>
    </div>
  </section>
);

export default Thanks;
