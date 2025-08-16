import React from 'react';
import { Title } from '@/components/ui/typography';
import { Paper } from '@/components/ui/paper';

const ContributeResource = () => (
  <section className="pt-10 pb-10">
    <Paper className="w-[95%] mx-auto p-2.5">
      <div>
        <Title
          as="h1"
          size="xl"
          className="my-2.5"
        >
          場域
        </Title>
        <div className="my-5">
          你知道什麼場域，抑或是想新增一個呢？ 歡迎來信至
          daodaoedunetwork@gmail.com 讓好的場域被更多人看見！
        </div>
        <iframe
          src="https://www.google.com/maps/d/embed?mid=14SDOGwpGbPWQHa52BTEUbMJx9eqJZCNO&hl=zh-TW"
          width="100%"
          height="480"
          title="地圖"
        />
      </div>
    </Paper>
  </section>
);

export default ContributeResource;
