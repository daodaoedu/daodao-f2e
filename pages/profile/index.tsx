import { useMemo, useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { ProtectedComponent } from '@/contexts/Auth';
import SEOConfig from '@/shared/components/SEO';
import AccountSetting from '@/components/Profile/Accountsetting';
import RecommendationSetting from '@/components/Profile/RecommendationSetting';
import DaodaoCoin from '@/components/Profile/DaodaoCoin';
import { cn } from '@/utils/cn';

interface TabPanelProps {
  children: React.ReactNode;
  value: number;
  index: number;
  isMobile: boolean;
}

function TabPanel({ children, value, index, isMobile }: TabPanelProps) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`vertical-tabpanel-${index}`}
      aria-labelledby={`vertical-tab-${index}`}
    >
      {value === index && (
        <div className={isMobile ? 'p-0' : 'p-3'}>
          {children}
        </div>
      )}
    </div>
  );
}

interface TabItem {
  id: string;
  tabLabel: string;
  view?: React.ReactNode;
}

const ProfilePage = () => {
  const router = useRouter();
  const [isMobile, setIsMobile] = useState<boolean>(false);

  // 檢測螢幕尺寸的 effect
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth <= 767);
    };

    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);

    return () => {
      window.removeEventListener('resize', checkIfMobile);
    };
  }, []);

  const tabs: TabItem[] = [
    {
      id: 'account-setting',
      tabLabel: '帳號設定',
      view: <AccountSetting />,
    },
    {
      id: 'personalized-recommendations',
      tabLabel: '個人化推薦',
      view: <RecommendationSetting />,
    },
    {
      id: 'daodao-coin',
      tabLabel: '島島幣',
      view: <DaodaoCoin />,
    }
  ];

  const [value, setValue] = useState<number>(0);

  // 初始化選中的標籤，基於 URL 參數
  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get('id');
    const tabIndex = tabs.findIndex((tab) => tab.id === id);
    if (tabIndex > -1) setValue(tabIndex);
  }, []);

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

  const handleChange = (index: number) => {
    setValue(index);
  };

  return (
    <ProtectedComponent>
      <SEOConfig data={SEOData} />
      <div className={cn(
        "flex justify-center pt-[50px] pb-[20px] min-h-[100vh]",
        "bg-gradient-to-b from-[#f3fcfc] to-[#f3fcfc] bg-[#f7f8fa]",
        "md:flex-row",
        isMobile && "flex-col mt-0 p-4"
      )}
      >
        <div className={cn(
          "w-[272px] h-max bg-white rounded-lg mt-[26px] mr-10 p-2",
          isMobile && "w-full h-auto p-0 mb-4 mr-0"
        )}
        >
          <div className={isMobile ? "flex overflow-x-auto" : "flex flex-col"}>
            {tabs.map((tab, index) => (
              <button
                type="button"
                key={tab.id}
                onClick={() => handleChange(index)}
                className={cn(
                  "text-[#536166] rounded-lg py-2 px-4 text-left",
                  "hover:bg-gray-50 transition-colors",
                  value === index && "bg-[#DEF5F5] text-[#16B9B3]",
                  isMobile ? "w-1/3" : "w-full"
                )}
                id={`vertical-tab-${index}`}
                aria-controls={`vertical-tabpanel-${index}`}
              >
                {tab.tabLabel}
              </button>
            ))}
          </div>
        </div>
        <div className="flex-1 max-w-[720px] min-h-[50vh]">
          {tabs.map((tab, index) => (
            <TabPanel key={tab.id} value={value} index={index} isMobile={isMobile}>
              {tab.view}
            </TabPanel>
          ))}
        </div>
      </div>
    </ProtectedComponent>
  );
};

export default ProfilePage;
