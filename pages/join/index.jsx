import { useMemo } from 'react';
import { useRouter } from 'next/navigation';

import { Title, Text } from '@/components/ui/typography';
import { Separator } from '@/components/ui/separator';
import SEOConfig from '@/components/SEOConfig';

import CheckIconSvg from '@/public/assets/icons/check_icon.svg';
import DiscordIconSvg from '@/public/assets/icons/discord_icon.svg';
import FacebookIconSvg from '@/public/assets/icons/facebook_icon.svg';

function JoinPage() {
  const router = useRouter();

  const discordCheckList = [
    '認識各領域跨齡學習者累積人脈',
    '各領域自主學習者即時交流',
    '輕鬆揪團與找學伴',
    '與夥伴進行學習挑戰',
    '與夥伴進行學習挑戰',
  ];
  const facebookCheckList = [
    '第一時間掌握學習資源與活動',
    '看到好資源立即轉分享',
  ];

  const SEOData = useMemo(
    () => ({
      title: '加入社群｜島島阿學',
      description:
        '在島島阿學，沒有人是一座孤島！歡迎加入島島阿學社群一起交流、學習、成長！社群即資源、支援，歡迎加入社群，一起在民主教育的社群中，以共好的概念，協助彼此學習的需求，支持彼此成為自己想成為的人吧！',
      keywords: '島島阿學',
      author: '島島阿學',
      copyright: '島島阿學',
      imgLink: 'https://www.daoedu.tw/assets/brand/horizontal-primary-logo.svg',
      link: `${process.env.HOSTNAME}${router?.asPath}`,
    }),
    [router?.asPath],
  );

  return (
    <div className="bg-[#f3fcfc]">
      <SEOConfig {...SEOData} />
      <div className="mx-auto py-[60px] pb-[72px] min-h-[calc(100vh-418px)] w-[640px] max-[800px]:px-4 max-[800px]:w-full">
        <div className="p-8 rounded-[20px] shadow-[0px_4px_6px_rgba(196,194,193,0.2)] bg-white">
          <div className="flex flex-col items-center">
            <Title as="h2" size="md" className="text-[22px] mb-2">
              加入社群
            </Title>
            <Text className="text-[#536166]">
              在島島阿學，沒有人是一座孤島！
            </Text>
            <Text className="text-[#536166]">
              歡迎加入島島阿學社群一起交流、學習、成長！
            </Text>
          </div>
          <ul className="my-[52px] mx-[72px] flex max-[800px]:my-[52px] max-[800px]:mx-0 max-[800px]:flex-col max-[800px]:gap-5">
            <li className="flex-1">
              <a 
                href="https://discord.gg/2NbQ7cu6jH" 
                target="_blank"
                className="flex flex-col items-center text-black max-[800px]:mx-auto max-[800px]:w-[232px] max-[800px]:items-start max-[800px]:[&>ul]:ml-4"
              >
                <div className="flex flex-col items-center [&>img]:mb-3 [&>h3]:flex [&>h3]:flex-col [&>h3]:items-center max-[800px]:flex-row max-[800px]:gap-3 max-[800px]:[&>img]:w-[50px] max-[800px]:[&>img]:h-[50px] max-[800px]:[&>h3]:items-start">
                  <DiscordIconSvg />
                  <Title as="h3" size="sm" className="text-base mb-5">
                    <span>Discord：</span>
                    <span>即時交流社群</span>
                  </Title>
                </div>
                <ul>
                  {discordCheckList.map((message) => (
                    <li key={message} className="flex items-center gap-2 [&+&]:mt-2">
                      <CheckIconSvg />
                      <Text size="sm" className="text-xs text-[#536166]">
                        {message}
                      </Text>
                    </li>
                  ))}
                </ul>
              </a>
            </li>
            <li className="flex-1">
              <a
                href="https://www.facebook.com/groups/2237666046370459"
                target="_blank"
                className="flex flex-col items-center text-black max-[800px]:mx-auto max-[800px]:w-[232px] max-[800px]:items-start max-[800px]:[&>ul]:ml-4"
              >
                <div className="flex flex-col items-center [&>img]:mb-3 [&>h3]:flex [&>h3]:flex-col [&>h3]:items-center max-[800px]:flex-row max-[800px]:gap-3 max-[800px]:[&>img]:w-[50px] max-[800px]:[&>img]:h-[50px] max-[800px]:[&>h3]:items-start">
                  <FacebookIconSvg />
                  <Title as="h3" size="sm" className="text-base mb-5">
                    <span>Facebook：</span>
                    <span>島島阿學－學習資源島</span>
                  </Title>
                </div>
                <ul>
                  {facebookCheckList.map((message) => (
                    <li key={message} className="flex items-center gap-2 [&+&]:mt-2">
                      <CheckIconSvg />
                      <Text size="sm" className="text-xs text-[#536166]">
                        {message}
                      </Text>
                    </li>
                  ))}
                </ul>
              </a>
            </li>
          </ul>
          <Separator className="mt-5 mb-1" />
          <div className="flex flex-col items-center">
            <Text className="text-[#536166]">
              社群即資源、支援，
            </Text>
            <Text className="text-[#536166]">
              歡迎加入社群，一起在民主教育的社群中，
            </Text>
            <Text className="text-[#536166]">
              以共好的概念，協助彼此學習的需求，支持彼此成為自己想成為的人吧！
            </Text>
          </div>
        </div>
      </div>
    </div>
  );
}

export default JoinPage;
