import React from 'react';
import { Title, Text } from '@/components/ui/typography';

const AwardInfo = () => (
  <section className="my-5">
    <Title
      as="h2"
      size="lg"
      className="mb-2.5 mt-10"
    >
      獲獎資訊
    </Title>
    <div className="m-5 flex flex-col">
      <Text className="my-1.5">
        <a
          target="_blank"
          href="https://lab.ocf.tw/2020/11/17/sch001/"
          rel="noopener noreferrer"
          className="text-black transition-colors duration-500 hover:text-[#16b9b3] hover:opacity-100"
        >
          📌 g0v零時小學校 demo day - 前五名
        </a>
      </Text>
      <Text className="my-1.5">
        <a
          target="_blank"
          href="https://edu100.parenting.com.tw/2021/detail/37#loaded"
          rel="noopener noreferrer"
          className="text-black transition-colors duration-500 hover:text-[#16b9b3] hover:opacity-100"
        >
          📌 親子天下教育創新 100 - 入選
        </a>
      </Text>
    </div>
  </section>
);

export default AwardInfo;
