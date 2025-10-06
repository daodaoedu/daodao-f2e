import React from 'react';
import { Title, Text } from '@/components/ui/typography';
import { ANCHOR_IDS } from '@/shared/constants';

export const Vision = () => (
  <section id={ANCHOR_IDS.VISION} className="my-10">
    <Title as="h2" size="lg" className="mb-5 mt-10">
      願景
    </Title>
    <div className="flex flex-col space-y-4">
      <Text className="text-lg leading-relaxed">
        在變動快速的世界裡，我們期待打造一個能跨越年齡、地理與制度界線的全球學習生態圈。匯集學習資源、促進互助支持，陪伴每位學習者展開獨特的成長旅程。
      </Text>
      <Text className="text-lg leading-relaxed">
        在這個生態圈中，每個人都是一座獨立又彼此連結的學習島嶼，同時是知識的創造者，也是學習的推動者。我們相信學習應該是連結而非孤單的旅程，讓透過經驗的分享與智慧的交流，共同編織支持彼此的學習網絡，重新打造喜歡的學習生活。
      </Text>
    </div>
  </section>
);
