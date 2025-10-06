import React from 'react';
import { Title, Text } from '@/shared/ui/typography';
import { ANCHOR_IDS } from '@/shared/constants';

export const Mission = () => (
  <section id={ANCHOR_IDS.MISSION} className="my-10">
    <Title as="h2" size="lg" className="mb-5 mt-10">
      使命
    </Title>
    <div className="flex flex-col space-y-4">
      <Text className="text-lg leading-relaxed">
        島島阿學致力於重塑學習的本質，我們相信學習應該是自主的、有意義的，並與真實世界緊密連結。在這個瞬息萬變的時代，我們打造一個讓每個人都能持續成長的學習生態圈。
      </Text>

      <div className="my-6">
        <Text className="mb-4 text-lg font-medium">
          在這裡，我們透過三個目標實踐使命：
        </Text>

        <div className="space-y-4">
          <div className="rounded-lg bg-gray-50 p-4">
            <Text className="mb-2 font-semibold text-[#16b9b3]">
              1. 以社群為基礎的自主學習
            </Text>
            <Text className="leading-relaxed">
              你不必獨自學習，社群成為你的夥伴與資源。
            </Text>
          </div>

          <div className="rounded-lg bg-gray-50 p-4">
            <Text className="mb-2 font-semibold text-[#16b9b3]">
              2. 讓多元經驗成為能力地圖
            </Text>
            <Text className="leading-relaxed">
              透過科技將學習經驗轉化為可見的成長軌跡。
            </Text>
          </div>

          <div className="rounded-lg bg-gray-50 p-4">
            <Text className="mb-2 font-semibold text-[#16b9b3]">
              3. 個人成長推動集體智慧
            </Text>
            <Text className="leading-relaxed">
              每位學習者的經驗都能啟發更多學習可能。
            </Text>
          </div>
        </div>
      </div>

      <Text className="text-center text-lg font-medium italic text-gray-700">
        我們相信：「學習不只是個人的修煉，更是一場彼此啟發的集體成長。」
      </Text>
    </div>
  </section>
);
