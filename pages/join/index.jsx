import { useMemo } from 'react';
import { useRouter } from 'next/router';
import styled from '@emotion/styled';

import {
  Box,
  Divider,
  Typography,
  Button,
  Skeleton,
  TextField,
} from '@mui/material';
import SEOConfig from '@/shared/components/SEO';
import Navigation from '@/shared/components/Navigation_v2';
import Footer from '@/shared/components/Footer_v2';

import checkIconSvg from '@/public/assets/icons/check_icon.svg';
import discordIconSvg from '@/public/assets/icons/discord_icon.svg';
import facebookIconSvg from '@/public/assets/icons/facebook_icon.svg';

const JoinPageWrapper = styled.div`
  --section-height: calc(100vh - 80px);
  --section-height-offset: 80px;
  background: #f3fcfc;
`;

const Container = styled.div`
  margin: 60px auto 72px;
  min-height: calc(100vh - 418px);
  width: 640px;

  @media (max-width: 800px) {
    padding: 0 16px;
    width: 100%;
  }
`;

const Paper = styled.main`
  padding: 32px;
  border-radius: 20px;
  box-shadow: 0px 4px 6px rgba(196, 194, 193, 0.2);
  background: #fff;
`;

const PaperColumnCenter = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const PaperBody = styled.ul`
  margin: 52px 72px 0;
  display: flex;

  @media (max-width: 800px) {
    margin: 52px 0 0;
    flex-direction: column;
    gap: 20px;
  }
`;

const PaperItem = styled.li`
  flex: 1;
`;

const PaperLink = styled.a`
  display: flex;
  flex-direction: column;
  align-items: center;
  color: black;

  @media (max-width: 800px) {
    margin: 0 auto;
    width: 232px;
    align-items: flex-start;

    > ul {
      margin-left: 16px;
    }
  }
`;

const PaperLinkHeader = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;

  > img {
    margin-bottom: 12px;
  }

  > h3 {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  @media (max-width: 800px) {
    flex-direction: row;
    gap: 12px;

    > img {
      width: 50px;
      height: 50px;
    }

    > h3 {
      align-items: flex-start;
    }
  }
`;

const CheckItem = styled.li`
  display: flex;
  align-items: center;
  gap: 8px;

  & + & {
    margin-top: 8px;
  }
`;

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
      imgLink: 'https://www.daoedu.tw/preview.webp',
      link: `${process.env.HOSTNAME}${router?.asPath}`,
    }),
    [router?.asPath],
  );

  return (
    <JoinPageWrapper>
      <SEOConfig data={SEOData} />
      <Navigation />
      <Container>
        <Paper>
          <PaperColumnCenter>
            <Typography variant="h2" fontSize="22px" marginBottom={0.5}>
              加入社群
            </Typography>
            <Typography variant="body2" color="#536166">
              在島島阿學，沒有人是一座孤島！
            </Typography>
            <Typography variant="body2" color="#536166">
              歡迎加入島島阿學社群一起交流、學習、成長！
            </Typography>
          </PaperColumnCenter>
          <PaperBody>
            <PaperItem>
              <PaperLink href="https://discord.gg/2NbQ7cu6jH" target="_blank">
                <PaperLinkHeader>
                  <img src={discordIconSvg.src} alt="discord" />
                  <Typography variant="h3" fontSize={16} marginBottom={1.25}>
                    <span>Discord：</span>
                    <span>即時交流社群</span>
                  </Typography>
                </PaperLinkHeader>
                <ul>
                  {discordCheckList.map((message) => (
                    <CheckItem key={message}>
                      <img src={checkIconSvg.src} alt="check" />
                      <Typography variant="body2" fontSize={12} color="#536166">
                        {message}
                      </Typography>
                    </CheckItem>
                  ))}
                </ul>
              </PaperLink>
            </PaperItem>
            <PaperItem>
              <PaperLink
                href="https://www.facebook.com/groups/2237666046370459"
                target="_blank"
              >
                <PaperLinkHeader>
                  <img src={facebookIconSvg.src} alt="facebook" />
                  <Typography variant="h3" fontSize={16} marginBottom={1.25}>
                    <span>Facebook：</span>
                    <span>島島阿學－學習資源島</span>
                  </Typography>
                </PaperLinkHeader>
                <ul>
                  {facebookCheckList.map((message) => (
                    <CheckItem key={message}>
                      <img src={checkIconSvg.src} alt="check" />
                      <Typography variant="body2" fontSize={12} color="#536166">
                        {message}
                      </Typography>
                    </CheckItem>
                  ))}
                </ul>
              </PaperLink>
            </PaperItem>
          </PaperBody>
          <Divider sx={{ marginTop: 5, marginBottom: 1 }} />
          <PaperColumnCenter>
            <Typography variant="body2" color="#536166">
              社群即資源、支援，
            </Typography>
            <Typography variant="body2" color="#536166">
              歡迎加入社群，一起在民主教育的社群中，
            </Typography>
            <Typography variant="body2" color="#536166">
              以共好的概念，協助彼此學習的需求，支持彼此成為自己想成為的人吧！
            </Typography>
          </PaperColumnCenter>
        </Paper>
      </Container>
      <Footer />
    </JoinPageWrapper>
  );
}

export default JoinPage;
