import { useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import { ProtectedComponent } from '@/contexts/Auth';
import SEOConfig from '@/components/SEOConfig';
import AccountSetting from '@/components/Profile/Accountsetting';
import useMediaQuery from '@/shared/lib/use-media-query';
import getEnv from '@/utils/env';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs';

const ProfilePage = () => {
  const router = useRouter();
  const mobileScreen = useMediaQuery('isSmall');
  const tabs = [
    {
      id: 'account-setting',
      tabLabel: '帳號設定',
      view: <AccountSetting />,
    },
    {
      id: 'personalized-recommendations',
      tabLabel: '個人化推薦',
    },
    {
      id: 'daodao-coin',
      tabLabel: '島島幣',
    }
  ];

  const [value, setValue] = useState(() => {
    if (getEnv().isServerSide) return 'account-setting';
    const id = new URLSearchParams(location.search).get('id');
    const tab = tabs.find((tab) => tab.id === id);
    if (tab) return tab.id;
    return 'account-setting';
  });

  const SEOData = useMemo(
    () => ({
      title: '編輯我的島島資料｜島島阿學',
      description:
        '「島島阿學」盼能透過建立多元的學習資源網絡，讓自主學習者能找到合適的成長方法，進一步成為自己想成為的人，從中培養共好精神。目前正積極打造「可共編的學習資源平台」。',
      keywords: '島島阿學',
      author: '島島阿學',
      copyright: '島島阿學',
      imgLink: 'https://www.daoedu.tw/assets/brand/horizontal-primary-logo.svg',
      link: `${process.env.HOSTNAME}${router?.asPath}`,
    }),
    [router?.asPath],
  );

  const handleTabChange = (newValue) => {
    setValue(newValue);
  };

  return (
    <ProtectedComponent>
      <SEOConfig {...SEOData} />
      <div className="flex justify-center mt-15 min-h-[calc(100vh-518px)] bg-gradient-to-r from-[#f3fcfc] to-[#f7f8fa] md:flex-row max-md:flex-col max-md:mt-0 max-md:p-4">
        <Tabs 
          value={value} 
          onValueChange={handleTabChange} 
          orientation={mobileScreen ? "horizontal" : "vertical"}
          className="flex md:flex-row max-md:flex-col gap-4"
        >
          <div className="w-[272px] h-max bg-white rounded-lg mr-10 mt-6 p-2 max-md:w-full max-md:h-auto max-md:p-0 max-md:mb-4">
            <TabsList className={`grid h-auto p-0 bg-transparent ${mobileScreen ? 'grid-cols-3' : 'grid-rows-3'} gap-1`}>
              {tabs.map((tab) => (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  className={`w-full text-[#536166] rounded-lg data-[state=active]:bg-[#DEF5F5] data-[state=active]:text-[#16B9B3] ${
                    mobileScreen ? 'w-1/3' : 'w-full'
                  }`}
                  disabled={!tab.view}
                >
                  {tab.tabLabel}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
          <div className="flex-1 max-w-[720px] min-h-[50vh]">
            {tabs.map((tab) => (
              <TabsContent key={tab.id} value={tab.id} className={mobileScreen ? 'p-0' : 'p-3'}>
                {tab.view}
              </TabsContent>
            ))}
          </div>
        </Tabs>
      </div>
    </ProtectedComponent>
  );
};

export default ProfilePage;
