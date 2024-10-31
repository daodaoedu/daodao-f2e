import React, { useMemo } from 'react';
import styled from '@emotion/styled';
import { useRouter } from 'next/router';
import { Box, Typography, Button, Modal } from '@mui/material';
import SEOConfig from '@/shared/components/SEO';
import Navigation from '@/shared/components/Navigation_v2';
import Footer from '@/shared/components/Footer_v2';

const HomePageWrapper = styled.div`
  --section-height: calc(100vh - 80px);
  --section-height-offset: 80px;
  background: linear-gradient(0deg, #f3fcfc, #f3fcfc), #f7f8fa;
`;

const ContentWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: #fff;
  border-radius: 16px;
  margin: 60px auto;
  max-width: 50%;
  width: 100%;
  @media (max-width: 767px) {
    max-width: 80%;
    .title {
      text-overflow: ellipsis;
      width: 100%;
    }
  }
`;
const StyledPopUpImg = styled.img`
  max-width: 100%;
  height: auto;
`;
function UnderAgePage() {
  const router = useRouter();
  const SEOData = useMemo(
    () => ({
      title: '島主廣播｜島島阿學',
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

  return (
    <>
      <SEOConfig data={SEOData} />
      <Box sx={{ minHeight: '100vh' }}>
        <ContentWrapper>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              padding: '40px 15px',
            }}
          />
          <Modal
            keepMounted
            open="true"
            onClose={() => {
              router.push('/');
            }}
            aria-labelledby="keep-mounted-modal-title"
            aria-describedby="keep-mounted-modal-description"
          >
            <Box
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: 400,
                bgcolor: 'background.paper',
                boxShadow: 24,
                borderRadius: '16px',
                maxWidth: '100%',
                p: 4,
              }}
            >
              <Typography
                id="keep-mounted-modal-title"
                variant="h3"
                component="h2"
                textAlign="center"
                sx={{
                  color: ' #536166',
                  fontWeight: 700,
                  fontWize: '22px',
                  lineHeight: '140%',
                  marginBottom: '8px',
                }}
              >
                島主廣播
              </Typography>
              <Typography
                id="keep-mounted-modal-description"
                textAlign="center"
                sx={{
                  mt: 2,
                  color: ' #536166',
                  fontWeight: 400,
                  fontWize: '14px',
                  lineHeight: '140%',
                  marginBottom: '8px',
                }}
              >
                你好像年紀有點小哦！島島阿學目前僅提供服務給 16
                歲以上使用者，期待跟長大後的你相遇！
              </Typography>
              <StyledPopUpImg
                src="/assets/underage-popup.png"
                alt="nobody-land"
                width="360"
                height="280"
              />
              <Box
                sx={{
                  mt: '40px',
                  width: '100%',
                  display: 'flex',
                }}
              >
                <Button
                  sx={{
                    width: '100%',
                    borderRadius: '20px',
                    ml: '4px',
                    color: '#ffff',
                    bgcolor: '#16B9B3',
                  }}
                  variant="contained"
                  onClick={() => {
                    router.push('/');
                  }}
                >
                  回首頁
                </Button>
              </Box>
            </Box>
          </Modal>
        </ContentWrapper>
      </Box>
    </>
  );
}

UnderAgePage.getLayout = ({ children }) => {
  return (
    <HomePageWrapper>
      <Navigation />
      {children}
      <Footer />
    </HomePageWrapper>
  );
};

export default UnderAgePage;
