import React from 'react';
import { Title, Text } from '@/components/ui/typography';
import { Button } from '@/components/ui/button';
import { Facebook } from 'lucide-react';
import { useRouter } from 'next/navigation';

const Group = () => {
  const router = useRouter();

  return (
    <div className="mx-auto w-[90%] py-10 max-md:pb-5 max-md:pt-10">
      <Title
        as="h2"
        size="lg"
        className="mr-5 text-right text-[26px] font-bold leading-[50px] tracking-[0.08em] text-[#536166] max-md:text-left"
      >
        加入島島阿學學習社群
      </Title>
      <div className="mt-5 flex items-start justify-center max-md:flex-col-reverse">
        <div className="ml-5 mt-12 text-lg">
          <div className="my-1.5">
            <Text>
              我們是島島阿學學習社群，努力搭起互助學習的橋梁。
            </Text>
          </div>
          <div className="my-1.5">
            <Text>
              期盼以集體智慧，打造沒有天花板的學習環境，一個以自主學習為主的民主社群。
            </Text>
          </div>
          <div className="my-1.5">
            <Text>
              目前提供學習資源網以及社群的服務，包含各領域各種形式的資源、學習活動、學習經驗、教育新聞等等。
            </Text>
          </div>
          <div className="my-1.5">
            <Text>
              我們認為社群即資源、支援，讓學習者在民主教育的社群中，以共好的概念，解決彼此學習的問題，支持彼此成為自己想成為的人。
            </Text>
          </div>
          <div className="mb-2.5 mt-5 flex items-center justify-start">
            <Button
              variant="outline"
              onClick={() => router.push('/join')}
              className="mx-2.5"
            >
              <Facebook style={{ margin: '5px 0' }} />
              <Text>加入社群</Text>
            </Button>
            <div>
              <Button
                variant="outline"
                className="mx-2.5 h-[46px]"
              >
                <Text>❤️ 送上祝福</Text>
              </Button>
            </div>
          </div>
        </div>
        <img
          src="/assets/circle.png"
          alt="circle"
          style={{ width: '400px', marginLeft: '20px' }}
        />
      </div>
    </div>
  );
};

export default Group;
