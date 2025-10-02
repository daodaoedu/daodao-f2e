import React from 'react';
import { useRouter } from 'next/navigation';
import { Title, Text } from '@/shared/ui/typography';
import { Badge } from '@/shared/ui/badge';
import { CATEGORIES } from '../../../constants/category';

const About = () => {
  const router = useRouter();
  return (
    <div className="mx-auto w-[90%] py-10 max-md:pb-5 max-md:pt-10">
      <Title
        as="h2"
        size="lg"
        className="ml-5 text-left text-[26px] font-bold leading-[50px] tracking-[0.08em] text-[#536166]"
      >
        來點島島阿學的資源吧！
      </Title>
      <div className="mt-5 flex items-start justify-center max-md:flex-col">
        <img
          src="/assets/coffeeandlearning.gif"
          width="200"
          height="200"
          alt="coffeeandlearning"
        />
        <div className="ml-5 mt-5 text-lg">
          <div className="my-1.5 text-xl font-medium">
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
                  className="duration-400 m-1 cursor-pointer whitespace-nowrap text-base font-medium opacity-60 transition-transform hover:opacity-100"
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
