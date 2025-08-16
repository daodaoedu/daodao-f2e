import React from 'react';
import { Title, Text } from '@/components/ui/typography';
import { Badge } from '@/components/ui/badge';
import { useRouter } from 'next/router';
import { CATEGORIES } from '../../../constants/category';

const About = () => {
  const router = useRouter();
  return (
    <div className="w-[90%] mx-auto pt-10 pb-10 max-md:pt-10 max-md:pb-5">
      <Title
        as="h2"
        size="lg"
        className="text-[#536166] font-bold text-[26px] leading-[50px] tracking-[0.08em] text-left ml-5"
      >
        來點島島阿學的資源吧！
      </Title>
      <div className="mt-5 flex justify-center items-start max-md:flex-col">
        <img
          src="/assets/coffeeandlearning.gif"
          width="200"
          height="200"
          alt="coffeeandlearning"
        />
        <div className="mt-5 ml-5 text-lg">
          <div className="my-1.5 font-medium text-xl">
            <Text>
              「學習資源爆炸多，卻常常找不到適合自己的？」
            </Text>
          </div>
          <div className="my-1.5">
            <Text>✅ 由各領域資深學習者分享及彙整</Text>
          </div>
          <div className="my-1.5">
            <Text>✅ 免費資源百百種</Text>
          </div>
          <div className="my-1.5">
            <Text>✅ 資源跨領域跨年齡跨國</Text>
          </div>
          <div className="my-1.5">
            <Text>✅ 三鍵篩選出合適資源</Text>
          </div>
          <div className="my-1.5">
            <Text>✅ 人人都可以分享資源</Text>
          </div>
          <div className="my-2.5">
            自主學習的時代，用共好共享成為彼此學習路上的橋樑吧！
          </div>
          <div className="my-5">
            <Text
              className="font-bold"
            >
              豐富的學習類別
            </Text>
            <div className="my-2.5">
              {CATEGORIES.map(({ value, label }) => (
                <Badge
                  key={value}
                  onClick={() => router.push(`/resource/categories/${value}`)}
                  className="cursor-pointer m-1 whitespace-nowrap font-medium text-base opacity-60 hover:opacity-100 transition-transform duration-400"
                  style={{ backgroundColor: 'rgb(219, 237, 219)' }}
                >
                  {label}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
