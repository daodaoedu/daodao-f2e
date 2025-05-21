import React, { useMemo } from 'react';
import styled from '@emotion/styled';
import { useRouter } from 'next/router';
import SEOConfig from '@/shared/components/SEO';
import { Box, Typography, Button } from "@mui/material";
import emailImg from '@/public/assets/mail.png';

const Wrapper = styled.div`
  background: linear-gradient(0deg, #F3FCFC 0%, #F3FCFC 100%), #F7F8FA;
`;

const StyledBar = styled(Box)`
  background-color: #FFF;
  display: flex;
  padding: 15px 6.9vw;
  flex-direction: column;
  align-items: flex-start;
  gap: 20px;
  align-self: stretch;
  border-radius: 8px;
  background: #FFF;
  box-shadow: 0px 4px 4px 0px rgba(0, 0, 0, 0.25);

  h2 {
    color: #16B9B3;
    flex-shrink: 0;
    font-family: "Noto Sans TC";
    font-size: 22px;
    font-weight: 700;
    line-height: 140%
  }
`;

const StyledButtonGroup = styled(Box)`
  width: 100%;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;

  @media (max-width: 767px) {
    width: 100%;
    grid-template-columns: 1fr;
    gap: 20px;
  }
`;

const StyledButton = styled(Button)(({ variant = 'contained' }) => ({
  ...(variant === 'contained' && {
    color: '#ffffff',
    backgroundColor: '#16b9b3',
  }),
  width: '100%',
  height: '40px',
  borderRadius: '20px',
}));

const StyledSection = styled(Box)`
  width: 39.1vw;
  max-width: 598px;
  margin: 0 auto;
  padding: 50px 16px;

  @media (max-width: 767px) {
    width: 100%;
    padding: 32px 16px;
  }
`;

const LearningMarathonSignUp = () => {
  const router = useRouter();
  const SEOData = useMemo(
    () => ({
      title: '申請島島盃 - 2025 春季學習馬拉松｜多元學習資源平台｜島島阿學',
      description:
        '「島島阿學」盼能透過建立多元的學習資源網絡，讓自主學習者能找到合適的成長方法，進一步成為自己想成為的人，從中培養共好精神。目前正積極打造「可共編的學習資源平台」。',
      keywords: '島島阿學',
      author: '島島阿學',
      copyright: '島島阿學',
      imgLink: 'https://www.daoedu.tw/preview.webp',
      link: `${process.env.HOSTNAME}${router?.asPath}`,
      jsonLd: [
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

  return (
    <Wrapper>
      <SEOConfig {...SEOData} />
      <StyledBar>
        <h2>申請參加島島盃學習馬拉松</h2>
      </StyledBar>
      <StyledSection>
        <Typography
          component="h2"
          sx={{
            fontSize: '22px',
            fontWeight: '700',
            lineHeight: '140%',
            color: '#536166',
            textAlign: 'center',
            marginBottom: '20px'
          }}
        >
          申請成功
        </Typography>
        <Typography
          component="p"
          sx={{
            fontSize: '16px',
            fontWeight: '400',
            lineHeight: '140%',
            color: '#536166',
            textAlign: 'center',
            marginBottom: '20px'
          }}
        >
          記得到信箱確認收到申請成功信，並確認信件沒有跑進垃圾桶。
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
          <img src={emailImg.src} alt="signup success" height="224px" />
        </Box>
        <Typography
          component="p"
          sx={{
            fontSize: '16px',
            fontWeight: '400',
            lineHeight: '140%',
            color: '#536166',
            textAlign: 'center',
            marginBottom: '20px'
          }}
        >
          接著可以...
        </Typography>
        <StyledButtonGroup>
          <StyledButton
            variant="outlined"
            onClick={() => router.push('/learning-marathon/signup')}
          >
            再次修改資料
          </StyledButton>
          <StyledButton
            variant="contained"
            onClick={() => router.push('/search')}
          >
            尋找學習資源
          </StyledButton>
        </StyledButtonGroup>
      </StyledSection>
    </Wrapper>
  );
};

export default LearningMarathonSignUp;
