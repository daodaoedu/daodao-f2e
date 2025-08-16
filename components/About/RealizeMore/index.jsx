import React from 'react';
import { Title, Text } from '@/components/ui/typography';

const RealizeMore = () => (
  <section className="my-5">
    <Title
      as="h2"
      size="lg"
      className="mt-10 mb-2.5"
    >
      想了解更多嗎？
    </Title>
    <div className="flex flex-col m-5">
      <Text className="my-1.5">
        <a
          target="_blank"
          href="https://www.youtube.com/watch?v=7d8e-onHJfo&t=80s"
          rel="noopener noreferrer"
          className="text-black hover:text-[#16b9b3] hover:opacity-100 transition-colors duration-500"
        >
          🤔 島島阿學｜如何透過集體智慧解決自主學習困境，推動民主教育？
        </a>
      </Text>
      <Text className="my-1.5">
        <a
          target="_blank"
          href="https://www.behance.net/gallery/113709435/_"
          rel="noopener noreferrer"
          className="text-black hover:text-[#16b9b3] hover:opacity-100 transition-colors duration-500"
        >
          🏃 島島阿學發展歷程
        </a>
      </Text>
    </div>
  </section>
);

export default RealizeMore;
