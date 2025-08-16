import React from 'react';
import { Title, Text } from '@/components/ui/typography';

const RelatedReport = () => (
  <section className="my-5">
    <Title
      as="h2"
      size="lg"
      className="mb-2.5 mt-10"
    >
      相關報導
    </Title>
    <div className="m-5 flex flex-col">
      <Text className="my-1.5">
        <a
          target="_blank"
          href="https://www.ner.gov.tw/program/5a83f4eac5fd8a01e2df012b/602e2793b702e0000801cf6e"
          rel="noopener noreferrer"
          className="text-black transition-colors duration-500 hover:text-[#16b9b3] hover:opacity-100"
        >
          📌 國立教育廣播電台 – 生活 In
          Design：青年打造理想國：《島島阿學》用科技及創意輔助學生線上自學
        </a>
      </Text>
      <Text className="my-1.5">
        <a
          target="_blank"
          href="https://drive.google.com/file/d/1rDerbtnV0Abk2QWRyRB_RTRDyKsvn48e/view"
          rel="noopener noreferrer"
          className="text-black transition-colors duration-500 hover:text-[#16b9b3] hover:opacity-100"
        >
          📌 零時小學校2020成果手冊：學生老師共創學習資源平台
          島島阿學開啟共學新時代
        </a>
      </Text>
      <Text className="my-1.5">
        <a
          target="_blank"
          href="https://lab.ocf.tw/2020/11/17/sch001/"
          rel="noopener noreferrer"
          className="text-black transition-colors duration-500 hover:text-[#16b9b3] hover:opacity-100"
        >
          📌 OCF
          Lab開放實驗室：連結科技社群與教育界，透過開源解決方案弭平教育的數位落差
        </a>
      </Text>
      <Text className="my-1.5">
        <a
          target="_blank"
          href="https://edu100.parenting.com.tw/2021/detail/37#loaded"
          rel="noopener noreferrer"
          className="text-black transition-colors duration-500 hover:text-[#16b9b3] hover:opacity-100"
        >
          📌 親子天下教育創新 100
        </a>
      </Text>
    </div>
  </section>
);

export default RelatedReport;
