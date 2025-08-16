import React from 'react';

import { Text, Title } from '@/components/ui/typography';
import { Paper } from '@/components/ui/paper';

const ContributeResource = () => (
  <section className="pb-10 pt-10">
    <Paper className="mx-auto w-[95%] p-5">
      <div>
        <Title
          as="h1"
          size="xl"
          className="my-2.5"
        >
          活動
        </Title>
        <Text
          className="my-5"
        >
          你知道什麼活動，抑或是想主辦一個呢？ 歡迎來信至
          daodaoedunetwork@gmail.com 讓好的活動被更多人看見！
        </Text>
        {/* eslint-disable-next-line jsx-a11y/iframe-has-title */}
        <iframe
          src="https://calendar.google.com/calendar/embed?src=9e60bdus3ht4umgkgvmqdrsjag%40group.calendar.google.com&ctz=Asia%2FTaipei"
          style={{
            border: 0,
            marginTop: '20px',
          }}
          width="100%"
          height="600"
          frameBorder="0"
          scrolling="no"
        />
      </div>
    </Paper>
  </section>
);

export default ContributeResource;
