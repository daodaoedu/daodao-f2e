import React, { useMemo, useState, useEffect } from 'react';
import styled from '@emotion/styled';
import { useRouter } from 'next/router';
import Script from 'next/script';
import {
  Box,
  Typography,
  Button,
  Skeleton,
  TextField,
  Divider,
  Switch,
  TextareaAutosize,
} from '@mui/material';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import toast from 'react-hot-toast';
import { useAuthState } from 'react-firebase-hooks/auth';
import { getAuth } from 'firebase/auth';
import SEOConfig from '../../../shared/components/SEO';
import Navigation from '../../../shared/components/Navigation_v2';
import Footer from '../../../shared/components/Footer_v2';

const HomePageWrapper = styled.div`
  --section-height: calc(100vh - 80px);
  --section-height-offset: 80px;
`;

const ContentWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: #fff;
  border: 1px solid #536166;
  border-radius: 8px;
  margin: 50px auto;
  padding: 40px 10px;
  max-width: 440px;
  width: 100%;
  @media (max-width: 767px) {
    width: 90%;
    .title {
      text-overflow: ellipsis;
      width: 100%;
    }
  }
`;

const EditPage = () => {
  const router = useRouter();
  const auth = getAuth();
  const [user, isLoading, isError] = useAuthState(auth);
  const [userName, setUserName] = useState('');
  useEffect(() => {
    setUserName(user?.displayName || '');
  }, [user]);

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

  return (
    <HomePageWrapper>
      <Script src="https://meet.jit.si/external_api.js" />
      <SEOConfig data={SEOData} />
      <Navigation />
      <Box sx={{ minHeight: '100vh' }}>
        <ContentWrapper>
          <Typography
            sx={{
              fontWeight: 700,
              fontSize: '22px',
              lineHeight: '140%',
              textAlign: 'center',
              color: '#536166',
            }}
          >
            編輯個人頁面
          </Typography>
          <Typography
            sx={{
              fontWeight: 700,
              fontSize: '14px',
              lineHeight: '140%',
              textAlign: 'center',
              color: '#536166',
              marginTop: '8px',
            }}
          >
            填寫完整資訊可以幫助其他夥伴更了解你哦！
          </Typography>
          <LazyLoadImage
            alt="login"
            src={user?.photoURL || ''}
            // "https://i.imgur.com/1nhGPPR.png"
            height={128}
            width={128}
            effect="opacity"
            style={{
              marginTop: '24px',
              borderRadius: '100%',
              background: 'rgba(240, 240, 240, .8)',
              objectFit: 'cover',
              objectPosition: 'center',
              minWidth: '128px',
              minHeight: '128px',
            }}
            placeholder={
              // eslint-disable-next-line react/jsx-wrap-multilines
              <Skeleton
                sx={{
                  height: '128px',
                  width: '128px',
                  background: 'rgba(240, 240, 240, .8)',
                  marginTop: '4px',
                }}
                variant="circular"
                animation="wave"
              />
            }
          />

          <Box sx={{ marginTop: '50px', width: '100%', padding: '0 5%' }}>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'flex-start',
                marginTop: '20px',
              }}
            >
              <Typography>您的名稱 *</Typography>
              <TextField
                sx={{ width: '100%' }}
                value={userName}
                onChange={(event) => setUserName(event.target.value)}
              />
            </Box>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'flex-start',
                marginTop: '20px',
              }}
            >
              <Typography>生日 *</Typography>
              <TextField sx={{ width: '100%' }} />
            </Box>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'flex-start',
                marginTop: '20px',
              }}
            >
              <Typography>性別 *</Typography>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  width: '100%',
                }}
              >
                <Box
                  sx={{
                    border: '1px solid #DBDBDB',
                    borderRadius: '8px',
                    padding: '10px',
                    width: 'calc(calc(100% - 16px) / 3)',
                    display: 'flex',
                    justifyItems: 'center',
                    alignItems: 'center',
                    cursor: 'pointer',
                  }}
                >
                  <Typography sx={{ margin: 'auto' }}>男性</Typography>
                </Box>
                <Box
                  sx={{
                    border: '1px solid #DBDBDB',
                    borderRadius: '8px',
                    padding: '10px',
                    width: 'calc(calc(100% - 16px) / 3)',
                    display: 'flex',
                    justifyItems: 'center',
                    alignItems: 'center',
                    cursor: 'pointer',
                  }}
                >
                  <Typography sx={{ margin: 'auto' }}>女性</Typography>
                </Box>
                <Box
                  sx={{
                    border: '1px solid #DBDBDB',
                    borderRadius: '8px',
                    padding: '10px',
                    width: 'calc(calc(100% - 16px) / 3)',
                    display: 'flex',
                    justifyItems: 'center',
                    alignItems: 'center',
                    cursor: 'pointer',
                  }}
                >
                  <Typography sx={{ margin: 'auto' }}>其他</Typography>
                </Box>
              </Box>
            </Box>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'flex-start',
                marginTop: '20px',
              }}
            >
              <Typography>身份 *</Typography>
            </Box>
            <Divider sx={{ margin: '32px 0' }} />
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'flex-start',
                marginTop: '20px',
              }}
            >
              <Typography>教育階段</Typography>
              <TextField
                sx={{ width: '100%' }}
                placeholder="請選擇您或孩子目前的教育階段"
              />
            </Box>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'flex-start',
                marginTop: '20px',
              }}
            >
              <Typography>居住地</Typography>
              <TextField sx={{ width: '100%' }} />
            </Box>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'flex-start',
                marginTop: '20px',
              }}
            >
              <Typography>想和夥伴一起</Typography>
              <TextField sx={{ width: '100%' }} />
            </Box>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'flex-start',
                marginTop: '20px',
              }}
            >
              <Typography>可以和夥伴分享的事物</Typography>
              <TextField
                sx={{ width: '100%' }}
                placeholder="ex.  自學申請、學習方法、學習資源，或各種學習領域的知識"
              />
            </Box>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'flex-start',
                marginTop: '20px',
              }}
            >
              <Typography>標籤</Typography>
              <TextField sx={{ width: '100%' }} placeholder="搜尋或新增標籤" />
              <Typography
                sx={{ color: '#92989A', fontWeight: 400, fontSize: '14px' }}
              >
                可以是學習領域、興趣等等的標籤，例如：音樂創作、程式語言、電繪、社會議題。
              </Typography>
            </Box>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'flex-start',
                marginTop: '20px',
              }}
            >
              <Typography>個人網站或社群</Typography>
              <TextField sx={{ width: '100%' }} placeholder="https://" />
            </Box>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'flex-start',
                marginTop: '20px',
              }}
            >
              <Typography>個人簡介</Typography>
              <TextareaAutosize
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '8px',
                  borderColor: 'rgb(0,0,0,0.87)',
                }}
                placeholder="寫下關於你的資訊，讓其他島民更認識你！也可以多描述想和夥伴一起做的事喔！"
              />
            </Box>
            <Divider sx={{ margin: '32px 0' }} />
            <Box
              sx={{
                border: '1px solid #DBDBDB',
                borderRadius: '8px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '13px 16px',
              }}
            >
              <Typography
                sx={{
                  fontWeight: 500,
                  fontSize: '16px',
                  lineHeight: '140%',
                  color: '#293A3D',
                }}
              >
                公開顯示居住地
              </Typography>
              <Switch />
            </Box>
            <Box
              sx={{
                border: '1px solid #DBDBDB',
                borderRadius: '8px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '13px 16px',
                marginTop: '16px',
              }}
            >
              <Typography
                sx={{
                  fontWeight: 500,
                  fontSize: '16px',
                  lineHeight: '140%',
                  color: '#293A3D',
                }}
              >
                公開個人頁面尋找夥伴
              </Typography>
              <Switch />
            </Box>
          </Box>

          <Box sx={{ marginTop: '40px', width: '100%' }}>
            <Button
              sx={{ width: '100%', borderRadius: '50px' }}
              variant="outlined"
              onClick={() => {
                toast.success('你點我做什麼？？？？');
              }}
            >
              儲存資料
            </Button>
            <Button
              sx={{ marginTop: '20px', width: '100%', borderRadius: '50px' }}
              variant="outlined"
              onClick={() => {
                toast.success('你點我做什麼？？？？');
              }}
            >
              查看我的頁面
            </Button>
          </Box>
        </ContentWrapper>
      </Box>
      <Footer />
    </HomePageWrapper>
  );
};

export default EditPage;
