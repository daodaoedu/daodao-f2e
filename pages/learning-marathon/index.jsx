import Link from 'next/link';
import React, { useEffect, useMemo, useState } from 'react';
import styled from '@emotion/styled';
import { useRouter } from 'next/router';
import SEOConfig from '@/shared/components/SEO';
import { GoArrowUpRight } from "react-icons/go";

import Navigation from '@/shared/components/Navigation_v2';
import Footer from '@/shared/components/Footer_v2';
import InfoCompletionGuard from '@/shared/components/InfoCompletionGuard';
import Button from '@mui/material/Button';
import Participant from '@/components/Marathon/Participant';
import Equip from '@/components/Marathon/Equip';
import Spotlight from '@/components/Marathon/Spotlight';
import Apply from '@/components/Marathon/Apply';
import Mentors from '@/components/Marathon/Mentors';
import Price from '@/components/Marathon/Price';
import Faq from '@/components/Marathon/Faq';

import { useAuth, useAuthDispatch } from '@/contexts/Auth';
import { cn } from '@/utils/cn';
import Banner from '@/components/Banner';

const HomePageWrapper = styled.div`
  --section-height: calc(100vh - 80px);
  --section-height-offset: 80px;
`;

const StyledBannerButton = styled(Button)`
  &.MuiButton-root {
    position: absolute;
    top: calc(100vw / 3.6);
    left: 50%;
    transform: translate(-50%);
    border-radius: 40px;
    background: #FFA10B;
    display: flex;
    width: 124px;
    height: 50px;
    padding: 5px 20px;
    justify-content: center;
    align-items: center;
    gap: 10px;
    flex-shrink: 0;
    color: #FFF;
  }
    &.MuiButton-text {
      color: #FFF;
      text-align: center;
      font-size: 18px;
      font-weight: 400;
      line-height: 140%;
    }

  @media (hover: hover) {
    &.MuiButton-root:hover {
      box-shadow: 0px 4px 10px 0px rgba(255, 161, 11, 0.50);
    }
  }

  @media (max-width: 767px) {
    &.MuiButton-root {
      top: calc(100vw / 1.434);
    }
  }
`;

const StyledSignUpButton = styled(Button)`
  border-radius: 20px;
  padding: 10px 20px;
  background-color: #16B9B3;
  font-size: 16px;
  font-weight: 400;
  line-height: 140%;
  color: #FFF;
  margin: 0 auto;
  display: inline-block;
  height: 40px;

  @media (hover: hover) {
    &:hover {
      background-color: #16B9B3;
      box-shadow: 0px 4px 10px 0px rgba(89, 182, 178, 0.50);
    }
  }
`;

const useScrollPaddingTop = () => {
  const [scrollPaddingTop, setScrollPaddingTop] = useState(0);

  useEffect(() => {
    const handleScrollPaddingTop = () => {
      const headerOffset = document.querySelector('header')?.offsetHeight || 0;
      const root = document.querySelector(":root");
      root.style.scrollPaddingTop = `${headerOffset + 80}px`;
      setScrollPaddingTop(headerOffset);
    };

    const handleStorage = () => {
      const isShowPromotionBar = localStorage.getItem('isShowPromotionBar');
      if (isShowPromotionBar) {
        handleScrollPaddingTop();
      }
    };

    handleScrollPaddingTop();
    window.addEventListener('storage', handleStorage);
    return () => {
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  return scrollPaddingTop;
};

const Sidebar = ({ onClickSignupButton }) => {
  const scrollPaddingTop = useScrollPaddingTop();
  const [activeSection, setActiveSection] = useState(null);
  const [isShow, setIsShow] = useState(false);

  const sidebarItems = [
    { label: '活動介紹', href: '#marathon-intro' },
    { label: '馬拉松進行方式', href: '#marathon-how' },
    { label: '引導師介紹', href: '#marathon-mentor' },
    { label: '你可以預期的收穫', href: '#marathon-benefit' },
    { label: '成果發表與獎勵', href: '#marathon-reward' },
    { label: '如何申請', href: '#marathon-apply' },
    { label: '本計畫價值', href: '#marathon-price' },
    { label: 'FAQ', href: '#marathon-faq' },
  ];

  useEffect(() => {
    const headings = Array.from(document.querySelectorAll('main h2'));
    const filteredHeadings = headings.filter(
      (heading) => sidebarItems.some((item) => item.href.replace('#', '') === heading.id),
    );
    const sections = filteredHeadings.map((heading) => heading.parentElement);

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(entry?.target?.children?.[0]?.id);
        }
      });
    });

    sections.forEach((section) => observer.observe(section));

    return () => {
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    const bannerHeight = document.querySelector('main')?.children?.[0]?.offsetHeight || 0;
    const handleScroll = () => {
      if (window.scrollY < bannerHeight || window.scrollY + window.innerHeight > document.body.scrollHeight - 250) {
        setIsShow(false);
      } else {
        setIsShow(true);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <aside
      className={cn(
        "hidden lg:block fixed left-8 top-[var(--sidebar-top)] max-h-[calc(100vh-var(--sidebar-top)-24px)] overflow-y-auto",
        "p-2 bg-white rounded-lg shadow-md transition-opacity duration-300 z-20",
        isShow ? 'opacity-100' : 'opacity-0 pointer-events-none',
      )}
      style={{ '--sidebar-top': `${scrollPaddingTop + 100}px` }}
    >
      <ul className="flex flex-col gap-2 mb-2">
        {sidebarItems.map((item) => (
          <li key={item.label}>
            <Link
              href={item.href}
              className={cn(
                "block body-lg font-medium p-2.5 rounded-lg text-basic-400 transition-colors duration-300",
                activeSection === item.href.replace('#', '') && 'text-primary-base bg-primary-lightest',
              )}
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
      <StyledSignUpButton className="w-full" onClick={onClickSignupButton}>立即申請</StyledSignUpButton>
    </aside>
  );
};

const Nav = () => {
  const navItems = [
    { label: '活動辦法', href: '#', active: true },
    { label: '活動公告', href: '/marathon-announcement' },
    { label: '自學計畫分享區', href: '/marathon-sharing', external: true },
    { label: '成果發表（未開放）', href: '#', disabled: true },
  ];

  const scrollPaddingTop = useScrollPaddingTop();

  return (
    <nav className="sticky z-10 bg-basic-100 text-nowrap overflow-x-auto" style={{ top: `${scrollPaddingTop}px` }}>
      <ul className="max-w-[750px] mx-auto flex justify-between gap-4">
        {navItems.map((item) => (
          <li key={item.label}>
            {item.disabled ? (
              <span className="block text-basic-300 cursor-not-allowed body-sm font-medium p-4">
                {item.label}
              </span>
            ) : (
              <Link
                href={item.href}
                target={item.external ? '_blank' : '_self'}
                rel={item.external ? 'noopener noreferrer' : ''}
                className={cn(
                  'relative block text-primary-base body-sm font-medium p-4 flex items-center gap-1',
                  item.active && 'before:content-[""] before:absolute before:bottom-2.5 before:left-4 before:right-4 before:h-[2px] before:bg-primary-base',
                )}
              >
                {item.label}
                {item.external && <GoArrowUpRight className="size-4" />}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </nav>
  );
};

const Section = ({ title, id, className, children, withContainer = true }) => (
  <section className={cn("py-8 px-6 md:py-[100px] body-md text-basic-400", className)}>
    <div className={cn(withContainer && "max-w-[750px] mx-auto lg:mr-12 min-[1100px]:mr-24 min-[1180px]:mr-auto")}>
      {title && <h2 className="heading-md text-basic-500" id={id}>{title}</h2>}
      {children}
    </div>
  </section>
);

const List = ({ className, children }) => (
  <ul className={cn("list-disc ml-6", className)}>{children}</ul>
);

const LearningMarathon = () => {
  const { openLoginModal } = useAuthDispatch();
  const { isLoggedIn, isTemporary } = useAuth();
  const router = useRouter();
  const SEOData = useMemo(
    () => ({
      title: '島島盃 - 2025 春季學習馬拉松｜多元學習資源平台｜島島阿學',
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

  const handleClickSignupButton = () => {
    if (isLoggedIn || isTemporary) {
      router.push('/learning-marathon/signup');
    } else {
      openLoginModal('/learning-marathon/signup');
    }
  };

  return (
    <>
      <SEOConfig data={SEOData} />
      <main>
        <Banner>
          <StyledBannerButton onClick={handleClickSignupButton}>
            立即申請
          </StyledBannerButton>
        </Banner>
        <Nav />
        <Sidebar onClickSignupButton={handleClickSignupButton} />
        <Section
          title="活動介紹"
          id="marathon-intro"
          className="bg-white"
        >
          <p className="mt-2.5 mb-5">
            學習這趟漫長的馬拉松，我可不可以用我的方式跑向屬於我的終點？<br />
            發展興趣、改變生活習慣、上理想的大學、生涯規劃、發起社會行動，每一個生活大小事都是一場學習馬拉松。然而，每一次的奮力前行總會遇到「不知道怎麼計畫」、「好難自律」、「沒有伴」、「資源與人脈有限」、「無限自我質疑」等難題...
          </p>
          <p>島島盃學習馬拉松將提供你四大裝備：</p>
          <List className="mb-5">
            <li>「專業陪跑員」陪你自我釐清與規劃路徑</li>
            <li>「百人社群」讓你找到合適夥伴與各界人脈</li>
            <li>「AI個人化數位工具」引導你學習方向與資源並自律學習</li>
            <li>「專業課程」帶你掌握自主學習要領</li>
          </List>
          <p className="mb-5">
            如果你有些想做的計畫，正在等待個契機開始，現在就是時候。<br />
            五個月的馬拉松後，你將會在計畫過程中「豐富知識經驗、在學習中形塑自我、為生活與社會帶來實際行動」，而最終的成果發表你還有機會獲得獎助金。
          </p>
          <p>
            島島盃 2025 春季學習馬拉松，將以學習者以自我需求出發設計學習計畫，開啟一趟自我導向學習馬拉松，往哪跑？怎麼跑？跑多快？終點在哪由你決定，島島阿學陪你一起跑。<br />
            邀請你一起「為自己重新打造喜歡的學習生活」，把自主學習變成一種生活方式，並在彼此陪伴下，成就自我與他人。
          </p>
        </Section>

        <Section
          title="誰適合參加？"
          id="marathon-who"
          className="bg-primary-lightest"
        >
          <List className="my-9">
            <li>16歲以上學習者皆可報名，優先以高中及大學生為主</li>
            <li>有意願為自己打造專屬學習旅程的學習者</li>
          </List>
          <p className="mb-2.5">
            如果你符合下列一項，那你也許就是適合的參加的人：
          </p>
          <div className="mb-2.5">
            <Participant />
          </div>
          <p>
            特別提醒：<br />
            活動重視社群互動與共學，若無法在計劃期間投入時間參與並和其他夥伴和 Mentor 互動，請斟酌申請。
          </p>
        </Section>

        <Section
          title="馬拉松進行方式"
          id="marathon-how"
          className="bg-white"
        >
          <h3 className="heading-sm text-basic-500 leading-[1.2] my-9">我們提供的裝備</h3>
          <Equip />
          <h3 className="heading-sm text-basic-500 leading-[1.2] my-9">這場馬拉松有什麼不一樣？</h3>
          <Spotlight />
        </Section>

        <Section
          className="bg-basic-100 px-0"
          withContainer={false}
        >
          <Mentors />
        </Section>

        <Section
          title="你可以預期的收穫"
          id="marathon-benefit"
          className="bg-primary-lightest"
        >
          <p className="mt-9 mb-5">
            只要申請，不論有無入選，就可以優先使用島島阿學 AI 個人化學習工具，包含自主學習模板、學習日誌、學習進度追蹤、AI智慧與引導等功能！
          </p>
          <p>
            而入選後，你還可以與專屬引導師與學習夥伴跑完一趟自我導向學習的馬拉松，完成遲遲未開始的計畫，並在過程中...
          </p>
          <List className="list-decimal">
            <li>習得AI世代不可或缺的「自主學習力、協作力、跨領域學習力」</li>
            <li>更深入認識自己，將學習與自身需求連結，找到學習的內在動機</li>
            <li>豐富學習資源與人脈，讓學習不再孤單，並增加學習可能性</li>
            <li>完成一份具體的學習計畫與成果，兼顧各自需求與外界認可</li>
            <li>成為助人者，完成整趟學習馬拉松者將獲得自主學習引導師優先培訓機會</li>
          </List>
        </Section>

        <Section
          title="成果發表與獎勵"
          id="marathon-reward"
          className="bg-white"
        >
          <p className="mt-3 mb-8">
            在學習馬拉松尾聲，針對入選的 20 位學員，島島阿學將舉辦成果分享日，並邀請引導師及入選者作為評審，更提供總獎金 NT$ 2,5000元 支持優秀計畫持續發展！
          </p>
          <h3 className="body-md text-black font-medium mb-3">獎勵</h3>
          <List className="mb-5">
            <li>為鼓勵學員的努力與支持持續發展，成果發表將選出 12 位學員，每位皆可獲得獎金、獎狀，以及島島阿學專訪與媒體曝光。計劃設有多層級獎項，涵蓋「學習達人獎」、「潛力無限獎」及「人氣獎」，具體分配如下：</li>
            <List>
              <li>
                [1 名] 學習達人獎：5000 元＋獎狀＋專訪
              </li>
              <li>
                [10 名] 潛力無限獎：2000 元＋獎狀＋專訪
              </li>
              <li>
                [2 名] 人氣獎：1000 元＋獎狀
              </li>
              <li>不論獲獎與否，所有學員皆會有參賽證明</li>
            </List>
            <li>評選方式：
              <List>
                <li>
                  學習達人獎、潛力無限獎：由評審團依據評選標準評選。
                </li>
                <li>人氣獎：開放現場與會者票選，根據票數高低決定得獎者。</li>
              </List>
            </li>
            <li>評選標準：
              <List>
                <li>
                  學習歷程紀錄與反思完成度（60%）：可以清楚學習每一個過程的狀態（如遇的困難、解決方法、心態等）、反思以及下一步行動的改變。
                </li>
                <li>學習成果完成度（40%）：學習成果達到預期的學習目標的程度。</li>
              </List>
            </li>
          </List>

          <h3 className="body-md text-black font-medium mb-3">分享路上的風景</h3>
          <List>
            <li>每位參與者在計劃結束時需在島島阿學網站公開學習計劃。</li>
            <li>每位參與者在計劃結束時須分享至少三個於計劃期間使用的學習資源，並分享使用心得。</li>
            <li>每位參與者需完成學習馬拉松回饋問卷。</li>
          </List>
        </Section>

        <Section
          title="如何申請"
          id="marathon-apply"
          className="bg-[#EEF9F9]"
        >
          <div className="mt-9">
            <Apply />
          </div>
        </Section>

        <Section
          title="入選後活動費用"
          id="marathon-price"
          className="bg-white"
        >
          <div className="mt-9">
            <Price />
          </div>
        </Section>

        <Section
          title="FAQ"
          id="marathon-faq"
          className="bg-white"
        >
          <div className="mt-9">
            <Faq />
          </div>
        </Section>

        <Section
          title="主辦單位介紹"
          id="marathon-organizer"
          className="bg-white"
        >
          <p className="my-2.5">
            島島阿學團隊由一群大學生、教育工作者、工程師和設計師等來自不同背景的夥伴組成。<br />
            島島阿學的使命是透過促進自我導向學習來實現終身學習的能力。我們致力於創造一個值得信賴的自主學習生態圈，讓學習者可以交流真實的學習經驗，透過自我探索、協作和成長，學習者可以充分發揮自己的潛力，並在瞬息萬變的世界中持續發展。<br />
            <br />
            島島阿學： https://www.daoedu.tw/<br />
            聯絡方式： contact@daoedu.tw
          </p>
          <h2 className="heading-md text-basic-500 mb-2.5">
            合作夥伴
          </h2>
          <p className="mb-2.5">
            魚水教育催化劑<br />
            青醒人共生文化智庫
          </p>
          <p>
            以上計畫細則主辦單位保留最終修改權利。
          </p>
        </Section>

        <Section className="text-center py-8 px-6 md:py-[50px]">
          <StyledSignUpButton
            onClick={handleClickSignupButton}
          >
            立即申請
          </StyledSignUpButton>
        </Section>
      </main>
    </>
  );
};

export default LearningMarathon;
