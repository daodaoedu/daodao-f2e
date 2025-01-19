import { useRouter } from 'next/router';
import { useState, useMemo, useEffect } from 'react';
import SEOConfig from '@/shared/components/SEO';
import { cn } from '@/utils/cn';
import DefaultLayout from "./DefaultLayout";

const SideButton = ({
  link,
  className,
  current
}) => {
  const activeClass = "text-primary-base bg-primary-lightest font-bold";
  const defaultClass = "text-basic-400 font-medium hover:text-primary-base hover:bg-primary-lightest hover:font-bold";
  const disableClass = "text-basic-300 font-medium";
  return (
    <button
      type="button"
      onClick={link.onClick}
      disabled={link.isDisabled}
      className={cn(
        `font-sans py-3 px-4 rounded-lg text-sm transition-colors
         ${
          link.isDisabled ?
          disableClass
          :
          link.id === current ?
          activeClass
          :
          defaultClass
        }`,
        className
      )}
    >
      {link.tabLabel}
    </button>
  );
};

const Sidebar = ({ current, tabs }) => {
  return (
    <div
      className="
        w-full h-auto bg-white
        rounded-lg mb-4
        p-0
        md:w-auto md:h-max md:p-2
        md:mt-0 md:mr-10 md:mb-0 md:ml-0
        overflow-x-scroll
      "
    >
      <div className="w-auto min-w-max flex flex-row h-12
          md:w-[272px] md:flex-col md:gap-2 md:h-auto"
      >
        {
          tabs.map((tab) => {
            return (
              <SideButton
                key={tab.id}
                link={tab}
                current={current}
              />
            );
          })
        }
      </div>
    </div>
  );
};
export default function ManageLayout({ children }) {
  const router = useRouter();
  const SEOData = useMemo(
    () => ({
      title: '我的小島｜多元學習資源平台｜島島阿學',
      description:
        '「島島阿學」盼能透過建立多元的學習資源網絡，讓自主學習者能找到合適的成長方法，進一步成為自己想成為的人，從中培養共好精神。目前正積極打造「可共編的學習資源平台」。',
      keywords: '島島阿學',
      author: '島島阿學',
      copyright: '島島阿學',
      imgLink: 'https://www.daoedu.tw/preview.webp',
      link: `${process.env.HOSTNAME}${router?.asPath}`,
      structuredData: [
        {
          '@context': 'https://schema.org',
          '@type': 'WebSite',
          url: 'https://www.daoedu.tw',
          potentialAction: {
            '@type': 'SearchAction',
            'query-input': 'required name=q',
            target: 'https://www.daoedu.tw/search?q={q}',
          },
        },
        {
          '@context': 'https://schema.org',
          '@type': 'Organization',
          url: 'https://www.daoedu.tw',
          logo: 'https://www.daoedu.tw/favicon-112.png',
        },
      ],
    }),
    [router?.asPath],
  );
  const tabs = [
    {
      id: 'island',
      tabLabel: '我的小島',
      isDisabled: false,
      onClick: () => {
        router.push('/manage?id=island');
      }
    },
    {
      id: 'studys',
      tabLabel: '我的學習計畫',
      isDisabled: true,
      onClick: () => {
        router.push('/manage/studys');
      }
    },
    {
      id: 'intro',
      tabLabel: '個人名片',
      isDisabled: false,
      onClick: () => {
        router.push('/personal-card/my-card');
      }
    },
    {
      id: 'treasure',
      tabLabel: '百寶箱',
      isDisabled: true,
      onClick: () => {
        router.push('/manage/treasure');
      }
    },
    {
      id: 'classroom',
      tabLabel: '我的教室',
      isDisabled: true,
      onClick: () => {
        router.push('/manage/classroom');
      }
    }
  ];
  const [currentPageId, setCurrentPageId] = useState(tabs[0].id);

  useEffect(() => {
    const { id } = router.query;
    const targetTab = tabs.filter((tab) => {
      return tab.id === id;
    });
    if (targetTab?.length) {
      setCurrentPageId(targetTab[0].id);
    } else {
      setCurrentPageId(tabs[0].id);
    }
  }, [router.query]);
  return (
    <DefaultLayout>
      <SEOConfig data={SEOData} />
      <div
        className="
          flex flex-col justify-center mt-0 p-4
          md:p-12 md:flex-row"
        style={{
          minHeight: 'calc(100vh - 518px)',
          background: 'linear-gradient(0deg, #f3fcfc, #f3fcfc), #f7f8fa'
        }}
      >
        <Sidebar current={currentPageId} tabs={tabs} />
        <div className="flex flex-1 max-w-[720px] min-h-[50vh]">
          {children}
        </div>
      </div>
    </DefaultLayout>
  );
}
