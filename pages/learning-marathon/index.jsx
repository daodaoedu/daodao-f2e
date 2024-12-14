import React, { useMemo, useEffect, useLayoutEffect } from 'react';
import styled from '@emotion/styled';
import { useRouter } from 'next/router';
import { sendLoginConfirmation } from '@/utils/openLoginWindow';
import SEOConfig from '@/shared/components/SEO';
import Image from '@/shared/components/Image';
import LearningMarathonImgDesktop from '@/public/assets/learning-marathon-2025S1-desktop@2x.png';
import LearningMarathonImgMobile from '@/public/assets/learning-marathon-2025S1-mobile@2x.png';

import Navigation from '@/shared/components/Navigation_v2';
import Footer from '@/shared/components/Footer_v2';
import InfoCompletionGuard from '@/shared/components/InfoCompletionGuard';
import {
  Typography,
  Box,
  Button,
} from '@mui/material';
import Link from 'next/link';
import Participant from '@/components/Marathon/Participant';
import Equip from '@/components/Marathon/Equip';
import Spotlight from '@/components/Marathon/Spotlight';
import Apply from '@/components/Marathon/Apply';
import Price from '@/components/Marathon/Price';
import Faq from '@/components/Marathon/Faq';

const HomePageWrapper = styled.div`
  --section-height: calc(100vh - 80px);
  --section-height-offset: 80px;
`;
const StyledBanner = styled(Box)`
  width: 100%;
  height: calc(100vw / 1.6);
  position: relative;
  box-sizing: border-size;

  .mobile {
    display: none;
  }

  @media (max-width: 767px) {
    height: calc(100vw / 0.6428);
    .desktop { display: none; }
    .mobile { display: block; }
  }
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

const StyledSection = styled(Box)`
  padding: 100px 24px;
  overflow: hidden;

  @media (max-width: 767px) {
    padding: 32px 24px;
  }
`;

const StyledContent = styled(Box)`
  width: 750px;
  max-width: 100%;
  margin: 0 auto;
`;

const StyledSectionTitle = styled(Typography)`
  font-size: 22px;
  font-style: normal;
  font-weight: 700;
  line-height: 140%;
  color: #293A3D;
`;

const StyledParagraph = styled(Typography)`
  font-size: 16px;
  font-style: normal;
  font-weight: 400;
  line-height: 140%;
  color: #536166;
`;

const StyledList = styled(Box)`
  ul { list-style-type: disc; }
  ol { list-style-type: numeric; }
  ol, ul {
    padding: 0 0 0 1.5em;

    ol, ul { padding-left: 3em; }

    li {
      color: #536166;
      font-size: 16px;
      font-weight: 400;
      line-height: 140%;
    }
  }
`;

const StyledLink = styled(Link)`
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
`;

const LearningMarathon = () => {
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

  const { token, id } = router.query;

  useEffect(() => {
    sendLoginConfirmation(id, token);
  }, [id, token]);

  useLayoutEffect(() => {
    const scrollToSection = () => {
      const hash = router.asPath.split('#')[1];
      if (hash) {
        const element = document.getElementById(hash);
        if (element) {
          requestAnimationFrame(() => {
            const headerOffset = document.querySelector('header')?.offsetHeight || 70;
            const elementPosition = element.getBoundingClientRect().top + window.scrollY;
            const offsetPosition = elementPosition - headerOffset;

            window.scrollTo({
              top: offsetPosition,
              behavior: 'smooth',
            });
          });
        }
      }
    };

    const timer = setTimeout(scrollToSection, 100);

    return () => clearTimeout(timer);
  }, [router.asPath]);

  return (
    <>
      <SEOConfig data={SEOData} />
      <Box>
        <StyledBanner>
          <Box className="desktop">
            <Image
              src={LearningMarathonImgDesktop.src}
              alt="島島盃 - 學習馬拉松 2025 春季賽"
              height="inherit"
              background="linear-gradient(#fcfefe 10%, #e0f1f2 40%)"
              borderRadius="0"
              className="desktop"
            />
          </Box>
          <Box className="mobile">
            <Image
              src={LearningMarathonImgMobile.src}
              alt="島島盃 - 學習馬拉松 2025 春季賽"
              height="inherit"
              background="linear-gradient(#fcfefe 10%, #e0f1f2 40%)"
              borderRadius="0"
              className="mobile"
            />
          </Box>
          <InfoCompletionGuard>
            <StyledBannerButton onClick={() => { router.push('/learning-marathon/login'); }}>
              立即報名
            </StyledBannerButton>
          </InfoCompletionGuard>
        </StyledBanner>
        <StyledSection
          component="section"
          sx={{
            backgroundColor: '#FFFFFF'
          }}
          id="event-intro"
        >
          <StyledContent>
            <StyledSectionTitle
              component="h2"
              sx={{
                marginBottom: '10px',
                paddingTop: '60px'
              }}
              id="marathon-intro"
            >
              活動介紹
            </StyledSectionTitle>
            <StyledParagraph
              component="p"
            >
              學習這趟漫長的馬拉松，我可不可以用我的方式跑向屬於我的終點？<br />
              發展興趣、改變生活習慣、上理想的大學、生涯規劃、發起社會行動，每一個生活大小事都是一場學習馬拉松。然而，每一次的奮力前行總會遇到「不知道怎麼計畫」、「好難自律」、「沒有伴」、「資源與人脈有限」、「無限自我質疑」等難題...<br />
              <br />
            </StyledParagraph>
            <StyledParagraph
              component="p"
            >
              島島盃將提供你四大裝備：
            </StyledParagraph>
            <StyledList>
              <ul>
                <li>「專業陪跑員」陪你規劃路徑與自我釐清</li>
                <li>「百人社群」讓你找到合適夥伴與各界人脈</li>
                <li>「AI個人化數位工具」讓你在紀錄與覆盤中自律學習、AI智慧推薦與引導</li>
                <li>「專業課程」帶你掌握自主學習要領</li>
              </ul>
              <br />
            </StyledList>
            <StyledParagraph
              component="p"
            >
              如果你有些想做的計畫，正在等待個契機開始，現在就是時候。<br />
              五個月的馬拉松後，你將會在計畫過程中「豐富知識經驗、在學習中形塑自我、為生活與社會帶來實際行動」，而最終的成果發表你還有機會獲得獎助金。
              <br />
            </StyledParagraph>
            <StyledParagraph
              component="p"
            >
              島島盃 2025 春季學習馬拉松，將以學習者以自我需求出發設計學習計畫，開啟一趟自我導向學習馬拉松，往哪跑？怎麼跑？跑多快？終點在哪由你決定，島島阿學陪你一起跑。<br />
              邀請你一起「為自己重新打造喜歡的學習生活」，讓我們陪伴彼此，成就自我與他人。
            </StyledParagraph>
          </StyledContent>
        </StyledSection>

        <StyledSection
          component="section"
          sx={{
            backgroundColor: '#DEF5F5',
          }}
        >
          <StyledContent>
            <StyledSectionTitle
              component="h2"
              sx={{
                marginBottom: '36px',
              }}
            >
              誰適合參加
            </StyledSectionTitle>
            <StyledList sx={{ marginBottom: '36px' }}>
              <ul>
                <li>16歲以上學習者皆可報名，優先以高中及大學生為主</li>
                <li>有意願為自己打造專屬學習旅程的學習者</li>
                <li>「百人社群」讓你找到合適夥伴與各界人脈</li>
                <li>「AI個人化數位工具」讓你在紀錄與覆盤中自律學習、AI智慧推薦與引導</li>
                <li>「專業課程」帶你掌握自主學習要領</li>
              </ul>
            </StyledList>
            <StyledParagraph
              component="p"
              sx={{ margin: '0 0 10px' }}
            >
              如果你符合下列一項，那你也許就是適合的參加的人：
            </StyledParagraph>
            <Box sx={{ marginBottom: '10px' }}>
              <Participant />
            </Box>
            <StyledParagraph
              component="p"
            >
              特別提醒： <br />
              活動重視社群互動與共學，若無法在計劃期間投入時間參與並和其他夥伴和 Mentor 互動，請斟酌報名。
            </StyledParagraph>
          </StyledContent>
        </StyledSection>

        <StyledSection
          component="section"
          sx={{
            backgroundColor: '#FFF'
          }}
        >
          <StyledContent>
            <StyledSectionTitle
              component="h2"
              sx={{
                marginBottom: '36px',
              }}
            >
              馬拉松進行方式
            </StyledSectionTitle>
            <Typography
              component="h3"
              sx={{
                fontSize: '18px',
                fontWeight: '700',
                lineHeight: '120%',
                marginBottom: '36px'
              }}
            >
              我們提供的裝備
            </Typography>
            <Box sx={{ marginBottom: '36px' }}>
              <Equip />
            </Box>
            <Typography
              component="h3"
              sx={{
                fontSize: '18px',
                fontWeight: '700',
                lineHeight: '120%',
                marginBottom: '36px'
              }}
            >
              這場馬拉松有什麼不一樣？
            </Typography>
            <Spotlight />
          </StyledContent>
        </StyledSection>

        <StyledSection
          component="section"
          sx={{
            backgroundColor: '#DEF5F5',
          }}
        >
          <StyledContent>
            <StyledSectionTitle
              component="h2"
              sx={{
                marginBottom: '36px',
              }}
            >
              你可以預期的收穫
            </StyledSectionTitle>
            <StyledParagraph
              component="p"
            >
              只要報名，不論有無入選，就可以優先使用島島阿學 AI 個人化學習工具，包含自主學習模板、學習日誌、學習進度追蹤、AI 智慧與引導等功能！
              <br />
            </StyledParagraph>
            <StyledParagraph>
              而入選後，你還可以與專屬引導師與學習夥伴跑完一趟自我導向學習的馬拉松，完成遲遲未開始的計畫，並在過程中...
            </StyledParagraph>
            <StyledList>
              <ol>
                <li>習得AI世代不可或缺的「自主學習力、協作力、跨領域學習力」</li>
                <li>更深入認識自己，將學習與自身需求連結，找到學習的內在動機</li>
                <li>豐富學習資源與人脈，讓學習不再孤單，並增加學習可能性</li>
                <li>完成一份具體的學習計畫與成果，兼顧各自需求與外界認可</li>
                <li>成為助人者，完成整趟學習馬拉松者將獲得自主學習引導師優先培訓機會</li>
              </ol>
            </StyledList>
          </StyledContent>
        </StyledSection>

        <StyledSection
          component="section"
          sx={{
            backgroundColor: '#FFF'
          }}
        >
          <StyledContent>
            <StyledSectionTitle
              component="h2"
              sx={{
                marginBottom: '12px',
              }}
            >
              成果發表與獎勵
            </StyledSectionTitle>
            <StyledParagraph
              component="p"
              sx={{
                marginBottom: '12px'
              }}
            >
              在學習馬拉松尾聲，針對入選的20位學員，島島阿學將舉辦成果分享日，並邀請引導師及入選者作為評審，更提供NT$ 5000元獎金支持優秀計畫持續發展！
              <br />
            </StyledParagraph>
            <Typography
              component="h3"
              sx={{
                marginBottom: '12px',
                fontSize: '16px',
                fontWeight: '500',
                lineHeight: '140%',
                color: '#000'
              }}
            >
              獎勵
            </Typography>
            <StyledList sx={{
              marginBottom: '12px'
            }}
            >
              <ul>
                <li>成果分享活動將選出5位優選參與者，每位可獲 NT$ 5000元獎金、優選證明，以及島島阿學專訪與媒體曝光。</li>
                <li>評選標準：
                  <ul>
                    <li>
                      學習歷程紀錄與反思完成度（60%）：可以清楚學習每一個過程的狀態（如遇的困難、解決方法、心態等）、反思以及下一步行動的改變。
                    </li>
                    <li>學習成果完成度（40%）：學習成果達到預期的學習目標的程度。</li>
                  </ul>
                </li>
              </ul>
              <br />
            </StyledList>

            <Typography
              component="h3"
              sx={{
                marginBottom: '12px',
                fontSize: '16px',
                fontWeight: '500',
                lineHeight: '140%',
                color: '#000'
              }}
            >
              分享路上的風景
            </Typography>
            <StyledList>
              <ul>
                <li>每位參與者在計劃結束時需在島島阿學網站公開學習計劃。</li>
                <li>每位參與者在計劃結束時須分享至少三個於計劃期間使用的學習資源，並分享使用心得。</li>
                <li>每位參與者需完成學習馬拉松回饋問卷。</li>
              </ul>
            </StyledList>
          </StyledContent>
        </StyledSection>

        <StyledSection
          component="section"
          sx={{
            backgroundColor: '#EEF9F9'
          }}
        >
          <StyledContent>
            <StyledSectionTitle
              component="h2"
              sx={{
                marginBottom: '36px'
              }}
            >
              如何申請
            </StyledSectionTitle>
            <Apply />
          </StyledContent>
        </StyledSection>

        <StyledSection
          component="section"
          sx={{
            backgroundColor: '#FFF'
          }}
        >
          <StyledContent>
            <StyledSectionTitle
              component="h2"
              sx={{
                marginBottom: '36px'
              }}
            >
              入選後課程費用
            </StyledSectionTitle>
            <Price />
          </StyledContent>
        </StyledSection>

        <Box sx={{
          background: {
            xs: "linear-gradient(0deg, #F3FCFC 0%, #F3FCFC 100%), linear-gradient(180deg, #F3FCFC 0%, #FFF 100%, #FFF 100%), #FFF",
            md: "none",
          },
        }}
        >
          <StyledSection
            component="section"
          >
            <StyledContent>
              <StyledSectionTitle
                component="h2"
                sx={{
                  marginBottom: '36px'
                }}
              >
                FAQ
              </StyledSectionTitle>
              <Faq />
            </StyledContent>
          </StyledSection>

          <StyledSection
            component="section"
          >
            <StyledContent>
              <StyledSectionTitle
                component="h2"
                sx={{
                  marginBottom: '10px'
                }}
              >
                主辦單位介紹
              </StyledSectionTitle>
              <StyledParagraph
                component="p"
                sx={{
                  marginBottom: '10px'
                }}
              >
                島島阿學團隊由一群大學生、教育工作者、工程師和設計師等來自不同背景的夥伴組成。<br />
                島島阿學的使命是透過促進自我導向學習來實現終身學習的能力。我們致力於創造一個值得信賴的自主學習生態圈，讓學習者可以交流真實的學習經驗，透過自我探索、協作和成長，學習者可以充分發揮自己的潛力，並在瞬息萬變的世界中持續發展。<br />
                <br />
                島島阿學：https://www.daoedu.tw/<br />
                聯絡方式：contact@daoedu.tw<br />
              </StyledParagraph>
              <StyledSectionTitle
                component="h2"
                sx={{
                  marginBottom: '10px'
                }}
              >
                合作夥伴
              </StyledSectionTitle>
              <StyledParagraph
                component="p"
                sx={{
                  marginBottom: '10px'
                }}
              >
                魚水教育催化劑<br />
                青醒人共生文化智庫<br />
              </StyledParagraph>
              <StyledParagraph
                component="p"
              >
                以上計畫細則主辦單位保留最終修改權利。
              </StyledParagraph>
            </StyledContent>
          </StyledSection>
        </Box>

        <StyledSection
          component="section"
          sx={{
            textAlign: 'center',
            padding: {
              md: '50px 24px',
              xs: '32px 24px'
            }
          }}
        >
          <StyledLink
            href="/learning-marathon/login"
          >
            立即報名
          </StyledLink>
        </StyledSection>
      </Box>
    </>
  );
};

LearningMarathon.getLayout = ({ children }) => {
  return (
    <HomePageWrapper>
      <Navigation />
      {children}
      <Footer />
    </HomePageWrapper>
  );
};

export default LearningMarathon;
