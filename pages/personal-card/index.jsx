import { useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import { ProtectedComponent, useAuth } from '@/contexts/Auth';
import Edit from '@/components/PersonalCard/Edit';
import SEOConfig from '@/components/SEOConfig';
import MyGroup from '@/components/PersonalCard/MyGroup';
import MyResource from '@/components/PersonalCard/MyResource';
import MyNote from '@/components/PersonalCard/MyNote';
import useMediaQuery from '@/hooks/useMediaQuery';
import getEnv from '@/utils/env';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const PersonalCardPage = () => {
  const router = useRouter();
  const mobileScreen = useMediaQuery('isSmall');
  const { user } = useAuth();
  const tabs = [
    {
      id: 'person-setting',
      tabLabel: '個人資料編輯',
      view: <Edit />,
    },
    {
      id: 'my-group',
      tabLabel: '我的揪團',
      view: <MyGroup title="我的揪團" userId={user?._id} />,
    },
    {
      id: 'my-resource',
      tabLabel: '我的學習資源',
      view: <MyResource title="我的學習資源" userId={user?._id} />,
    },
    {
      id: 'my-project',
      tabLabel: '我的學習計畫',
    },
    {
      id: 'my-note ',
      tabLabel: '我的便利貼',
      view: <MyNote title="我的便利貼" userId={user?._id} />,
    },
  ];

  const [value, setValue] = useState(() => {
    if (getEnv().isServerSide) return 'person-setting';
    const id = new URLSearchParams(location.search).get('id');
    const tab = tabs.find((tab) => tab.id === id);
    if (tab) return tab.id;
    return 'person-setting';
  });

  const SEOData = useMemo(
    () => ({
      title: '編輯我的島島資料｜島島阿學',
      description:
        '「島島阿學」盼能透過建立多元的學習資源網絡，讓自主學習者能找到合適的成長方法，進一步成為自己想成為的人，從中培養共好精神。目前正積極打造「可共編的學習資源平台」。',
      keywords: '島島阿學',
      author: '島島阿學',
      copyright: '島島阿學',
      imgLink: 'https://www.daoedu.tw/preview.webp',
      link: `${process.env.HOSTNAME}${router?.asPath}`,
    }),
    [router?.asPath],
  );

  const handleTabChange = (newValue) => {
    setValue(newValue);
    if (newValue === 'my-project') {
      router.push('/my-project');
    }
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
            <TabsList className={`grid h-auto p-0 bg-transparent ${mobileScreen ? 'grid-cols-3' : 'grid-rows-5'} gap-1`}>
              {tabs.map((tab) => (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  className={`w-full text-[#536166] rounded-lg data-[state=active]:bg-[#DEF5F5] data-[state=active]:text-[#16B9B3] ${
                    mobileScreen ? 'w-1/3' : 'w-full'
                  }`}
                  disabled={tab.id === 'my-project'}
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

export default PersonalCardPage;
