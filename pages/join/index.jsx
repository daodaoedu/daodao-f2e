import { useMemo } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import styled from '@emotion/styled';
import { Typography, Box, Container, Grid, Paper } from '@mui/material';

import SEOConfig from '@/shared/components/SEO';
import CheckIconSvg from '@/public/assets/icons/check_icon.svg';
import DiscordIconSvg from '@/public/assets/icons/discord_icon.svg';
import FacebookIconSvg from '@/public/assets/icons/facebook_icon.svg';
import dynamic from 'next/dynamic';

// 動態導入 Instagram 圖標以避免可能的導入問題
const InstagramIconSvg = dynamic(() => import('@/public/assets/icons/instagram_icon.svg'), {
  ssr: false,
  loading: () => <div style={{ width: 60, height: 60 }} />
});

// 樣式定義
const PageWrapper = styled.div`
  background: #f3fcfc;
  padding: 60px 0;
  min-height: calc(100vh - var(--padding-top, 0px) - 270px);
  
  @media (max-width: 768px) {
    padding: 40px 0;
  }
`;

const PageTitle = styled.div`
  text-align: center;
  margin-bottom: 48px;
  
  @media (max-width: 768px) {
    margin-bottom: 32px;
    padding: 0 16px;
  }
`;

const StyledPaper = styled(Paper)`
  padding: 32px;
  border-radius: 20px;
  box-shadow: 0px 4px 20px rgba(0, 0, 0, 0.08);
  height: 100%;
  display: flex;
  flex-direction: column;
  transition: transform 0.3s ease, box-shadow 0.3s ease, background-color 0.3s ease;
  overflow: hidden;
  position: relative;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 6px;
    background-color: #16b9b3;
    transform: scaleX(0);
    transform-origin: left;
    transition: transform 0.3s ease;
  }

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0px 8px 24px rgba(0, 0, 0, 0.12);
  }

  &:hover::before {
    transform: scaleX(1);
  }
`;

const CommunityTag = styled.div`
  position: absolute;
  top: 16px;
  right: 16px;
  background-color: #def5f5;
  color: #295e5c;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
`;

const PlatformIcon = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 24px;

  svg {
    width: 60px;
    height: 60px;
  }
`;

const PlatformTitle = styled(Typography)`
  text-align: center;
  margin-bottom: 24px;
  font-weight: bold;
`;

const FeatureList = styled.ul`
  padding-left: 0;
  margin-bottom: 24px;
  flex-grow: 1;
`;

const FeatureItem = styled.li`
  display: flex;
  align-items: flex-start;
  margin-bottom: 16px;
  
  svg {
    margin-right: 12px;
    min-width: 20px;
    margin-top: 2px;
  }
`;

const JoinButtonWrapper = styled.div`
  text-align: center;
  margin-top: auto;
`;

const JoinButton = styled.a`
  display: inline-block;
  background-color: #16b9b3;
  color: white;
  padding: 12px 24px;
  border-radius: 8px;
  text-decoration: none;
  font-weight: bold;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;

  &:hover {
    background-color: #129792;
    transform: translateY(-2px);
  }
  
  &::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 5px;
    height: 5px;
    background: rgba(255, 255, 255, 0.4);
    opacity: 0;
    border-radius: 100%;
    transform: scale(1, 1) translate(-50%);
    transform-origin: 50% 50%;
  }
  
  &:active::after {
    animation: ripple 0.6s ease-out;
  }
  
  @keyframes ripple {
    0% {
      transform: scale(0, 0);
      opacity: 1;
    }
    20% {
      transform: scale(25, 25);
      opacity: 1;
    }
    100% {
      opacity: 0;
      transform: scale(40, 40);
    }
  }
`;

const DescriptionSection = styled.div`
  text-align: center;
  margin-top: 48px;
  max-width: 700px;
  margin-left: auto;
  margin-right: auto;
  
  @media (max-width: 768px) {
    margin-top: 32px;
    padding: 0 16px;
  }
`;

const StatisticItem = styled(Box)`
  text-align: center;
  padding: 16px;
  background-color: #ffffff;
  border-radius: 12px;
  box-shadow: 0px 2px 8px rgba(0, 0, 0, 0.06);
  transition: transform 0.3s ease;
  
  &:hover {
    transform: translateY(-5px);
  }
`;

// 自定義滿意度分數元件
const SatisfactionScore = ({ score }) => {
  return (
    <Box display="flex" alignItems="center" mt={1} mb={2}>
      <Typography variant="body2" color="#536166" mr={1}>滿意度：</Typography>
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          style={{
          color: star <= score ? '#FFD700' : '#E0E0E0',
          marginRight: '2px',
          fontSize: '16px'
        }}
        >
          ★
        </span>
      ))}
    </Box>
  );
};

function JoinPage() {
  const router = useRouter();

  const discordFeatures = [
    '認識各領域跨齡學習者累積人脈',
    '各領域自主學習者即時交流',
    '輕鬆揪團與找學伴',
    '與夥伴進行學習挑戰',
    '獲得學習資源推薦',
  ];

  const facebookFeatures = [
    '第一時間掌握學習資源與活動',
    '看到好資源立即轉分享',
    '認識更多學習夥伴',
    '參與島島阿學舉辦的活動',
  ];

  const instagramFeatures = [
    '獲取每日學習靈感',
    '了解島島最新動態',
    '查看自學故事和成果',
    '參與互動式學習挑戰',
  ];

  const statsData = [
    { label: '社群成員總數', value: '5,000+', icon: '🌍' },
    { label: '活躍學習者', value: '2,800+', icon: '📖' },
    { label: '分享的資源', value: '1,200+', icon: '📋' },
    { label: '學習社群活動', value: '120+', icon: '🌟' },
  ];

  const SEOData = useMemo(
    () => ({
      title: '加入社群｜島島阿學',
      description:
        '在島島阿學，沒有人是一座孤島！歡迎加入島島阿學社群一起交流、學習、成長！社群即資源、支援，歡迎加入社群，一起在民主教育的社群中，以共好的概念，協助彼此學習的需求，支持彼此成為自己想成為的人吧！',
      keywords: '島島阿學,社群,Discord,Facebook,自主學習,學習資源',
      author: '島島阿學',
      copyright: '島島阿學',
      imgLink: 'https://www.daoedu.tw/preview.webp',
      link: `${process.env.HOSTNAME}${router?.asPath}`,
    }),
    [router?.asPath],
  );

  return (
    <PageWrapper>
      <SEOConfig data={SEOData} />
      <Container>
        <PageTitle>
          <Typography variant="h2" fontSize={28} fontWeight="bold" gutterBottom>
            加入島島阿學社群
          </Typography>
          <Typography variant="body1" color="#536166">
            在島島阿學，沒有人是一座孤島！歡迎加入我們的社群一起交流、學習、成長！
          </Typography>
        </PageTitle>

        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <StyledPaper>
              <CommunityTag>熱門社群</CommunityTag>
              <PlatformIcon>
                <DiscordIconSvg />
              </PlatformIcon>
              <PlatformTitle variant="h3" fontSize={20}>
                Discord 即時交流社群
              </PlatformTitle>
              <FeatureList>
                {discordFeatures.map((feature) => (
                  <FeatureItem key={feature}>
                    <CheckIconSvg />
                    <Typography variant="body2">{feature}</Typography>
                  </FeatureItem>
                ))}
              </FeatureList>
              <Box mb={3}>
                <Typography variant="body2" color="#536166" fontSize="12px" fontStyle="italic">
                  「在 Discord 我認識了同樣熱愛藝術的夥伴，現在我們每週都會一起交流分享創作！」
                </Typography>
                <Typography variant="body2" color="#536166" fontSize="12px" textAlign="right">
                  — 小永，學生
                </Typography>
                <SatisfactionScore score={5} />
              </Box>
              <JoinButtonWrapper>
                <JoinButton href="https://discord.gg/2NbQ7cu6jH" target="_blank">
                  加入 Discord
                </JoinButton>
              </JoinButtonWrapper>
            </StyledPaper>
          </Grid>

          <Grid item xs={12} md={4}>
            <StyledPaper>
              <CommunityTag>資源分享</CommunityTag>
              <PlatformIcon>
                <FacebookIconSvg />
              </PlatformIcon>
              <PlatformTitle variant="h3" fontSize={20}>
                Facebook 學習資源島
              </PlatformTitle>
              <FeatureList>
                {facebookFeatures.map((feature) => (
                  <FeatureItem key={feature}>
                    <CheckIconSvg />
                    <Typography variant="body2">{feature}</Typography>
                  </FeatureItem>
                ))}
              </FeatureList>
              <Box mb={3}>
                <Typography variant="body2" color="#536166" fontSize="12px" fontStyle="italic">
                  「在社團裡看到的一個網路課程推薦，幫助我完成了長期想學的專業技能！」
                </Typography>
                <Typography variant="body2" color="#536166" fontSize="12px" textAlign="right">
                  — 小美，上班族
                </Typography>
                <SatisfactionScore score={4} />
              </Box>
              <JoinButtonWrapper>
                <JoinButton href="https://www.facebook.com/groups/2237666046370459" target="_blank">
                  加入 Facebook 社團
                </JoinButton>
              </JoinButtonWrapper>
            </StyledPaper>
          </Grid>

          <Grid item xs={12} md={4}>
            <StyledPaper>
              <CommunityTag>靈感與分享</CommunityTag>
              <PlatformIcon>
                <InstagramIconSvg />
              </PlatformIcon>
              <PlatformTitle variant="h3" fontSize={20}>
                Instagram 社群頁面
              </PlatformTitle>
              <FeatureList>
                {instagramFeatures.map((feature) => (
                  <FeatureItem key={feature}>
                    <CheckIconSvg />
                    <Typography variant="body2">{feature}</Typography>
                  </FeatureItem>
                ))}
              </FeatureList>
              <Box mb={3}>
                <Typography variant="body2" color="#536166" fontSize="12px" fontStyle="italic">
                  「常常在 Instagram 看到島島的每日學習靈感和分享，給我帶來很多新的學習角度！」
                </Typography>
                <Typography variant="body2" color="#536166" fontSize="12px" textAlign="right">
                  — 小華，自學者
                </Typography>
                <SatisfactionScore score={5} />
              </Box>
              <JoinButtonWrapper>
                <JoinButton href="https://www.instagram.com/daodao_edu/" target="_blank">
                  追蹤 Instagram
                </JoinButton>
              </JoinButtonWrapper>
            </StyledPaper>
          </Grid>
        </Grid>

        {/* 社群統計數據 */}
        <Box mt={6} mb={6}>
          <Typography variant="h3" fontSize={24} fontWeight="bold" textAlign="center" mb={4}>
            島島阿學社群共學成效
          </Typography>
          <Grid container spacing={3} justifyContent="center">
            {statsData.map((stat) => (
              <Grid item xs={6} sm={3} key={stat.label}>
                <StatisticItem>
                  <Typography variant="h3" fontSize={28} mb={1}>
                    {stat.icon}
                  </Typography>
                  <Typography variant="h4" fontSize={24} fontWeight="bold" color="#16b9b3">
                    {stat.value}
                  </Typography>
                  <Typography variant="body2" color="#536166">
                    {stat.label}
                  </Typography>
                </StatisticItem>
              </Grid>
            ))}
          </Grid>
        </Box>

        <DescriptionSection>
          <Box mb={4} p={3} sx={{ backgroundColor: '#def5f5', borderRadius: '16px' }}>
            <Typography variant="h4" fontSize={20} color="#295e5c" fontWeight="bold" gutterBottom>
              為什麼加入島島阿學社群？
            </Typography>
            <Typography variant="body1" color="#536166" paragraph>
              社群即資源、支援，歡迎加入島島阿學社群，一起在民主教育的環境中，以共好的概念，協助彼此學習的需求。
            </Typography>
            <Typography variant="body1" color="#536166">
              支持彼此成為自己想成為的人，一同開創自主學習的新時代！
            </Typography>
          </Box>

          <Box mt={4} display="flex" justifyContent="center">
            <Link href="/about" passHref>
              <Typography
                component="a"
                color="#16b9b3"
                style={{
                  textDecoration: 'none',
                  fontWeight: 'bold',
                  padding: '10px 20px',
                  border: '2px solid #16b9b3',
                  borderRadius: '8px',
                  transition: 'all 0.3s ease'
                }}
                className="about-link-hover"
              >
                了解更多島島阿學理念 →
              </Typography>
            </Link>
          </Box>

          <style jsx global>{`
            .about-link-hover:hover {
              background-color: #16b9b3;
              color: white;
            }
          `}
          </style>
        </DescriptionSection>

        {/* FAQ 區域 */}
        <Box mt={8} mb={4} maxWidth="800px" mx="auto">
          <Typography variant="h3" fontSize={24} fontWeight="bold" textAlign="center" mb={4}>
            常見問題
          </Typography>

          <Box mb={3}>
            <Box p={3} sx={{ backgroundColor: '#fff', borderRadius: '10px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
              <Typography variant="h4" fontSize={18} fontWeight="bold" color="#295e5c" mb={1}>
                Q: 如何開始參與島島阿學的社群活動？
              </Typography>
              <Typography variant="body1" color="#536166">
                A: 您可以先加入我們的 Discord 或 Facebook 社群，閱讀社群規範，然後自行介紹您的學習興趣。我們有定期的線上與線下活動，分享會與學習連結，歡迎您的參與！
              </Typography>
            </Box>
          </Box>

          <Box mb={3}>
            <Box p={3} sx={{ backgroundColor: '#fff', borderRadius: '10px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
              <Typography variant="h4" fontSize={18} fontWeight="bold" color="#295e5c" mb={1}>
                Q: 我可以在社群中分享我的學習資源嗎？
              </Typography>
              <Typography variant="body1" color="#536166">
                A: 非常歡迎！島島阿學鼓勵社群成員分享優質的學習資源與心得。請注意使用正確的選擇的標籤或資源類型，以幫助其他成員更容易找到您的分享。
              </Typography>
            </Box>
          </Box>

          <Box mb={3}>
            <Box p={3} sx={{ backgroundColor: '#fff', borderRadius: '10px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
              <Typography variant="h4" fontSize={18} fontWeight="bold" color="#295e5c" mb={1}>
                Q: 如何找到適合我的學習夥伴或小組？
              </Typography>
              <Typography variant="body1" color="#536166">
                A: 您可以在 Discord 社群中的「學習揺團」區域發表您的學習項目或興趣，尋找序伴。也可以參與我們定期舉辦的「學習配對」活動，更容易找到志同道合的學習夥伴。
              </Typography>
            </Box>
          </Box>

          <Box className="text-center" mt={4}>
            <Link href="/terms/faq" passHref>
              <Typography
                component="a"
                color="#16b9b3"
                sx={{ textDecoration: 'none', fontWeight: 'bold', cursor: 'pointer' }}
              >
                查看更多常見問題 →
              </Typography>
            </Link>
          </Box>
        </Box>
      </Container>
    </PageWrapper>
  );
}

export default JoinPage;
