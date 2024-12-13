import styled from '@emotion/styled';
import { Box, Button, Typography, Skeleton } from '@mui/material';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import { CATEGORIES } from '@/constants/member';

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

// TODO: 待重構
function Step2({ onChangeHandler, userState = {}, onBack, onNext }) {
  const { interestList = [] } = userState;

  return (
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
        >
          <Typography
            sx={{
              fontWeight: 700,
              fontSize: '22px',
              lineHeight: '140%',
              textAlign: 'center',
              color: '#536166',
            }}
          >
            您對哪些領域感興趣？
          </Typography>
          <Typography
            sx={{
              fontWeight: 400,
              fontSize: '14px',
              lineHeight: '140%',
              textAlign: 'center',
              color: '#536166',
              mt: '8px',
            }}
          >
            請選擇2-6個您想要關注的學習領域
          </Typography>
          <Box sx={{ width: '100%', marginTop: '16px' }}>
            <Box
              sx={{
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'space-between',
                alignItems: 'center',
                width: '100%',
              }}
            >
              {CATEGORIES.map(({ label, value, image }) => (
                <Box
                  key={label}
                  onClick={() => {
                    onChangeHandler({
                      key: 'interestList',
                      value: interestList.includes(value)
                        ? interestList.filter((data) => data !== value)
                        : [...interestList, value],
                    });
                  }}
                  sx={{
                    border: '1px solid #DBDBDB',
                    borderRadius: '8px',
                    margin: '4px',
                    padding: '10px',
                    width: 'calc(calc(100% - 32px) / 4)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyItems: 'center',
                    alignItems: 'center',
                    cursor: 'pointer',
                    ...(interestList.includes(value)
                      ? {
                        backgroundColor: '#DEF5F5',
                        border: '1px solid #16B9B3',
                      }
                      : {}),
                    '@media (max-width: 767px)': {
                      height: '100% auto',
                      width: 'calc(calc(100% - 24px) / 2)',
                      flexBasis: 'calc(calc(100% - 24px) / 2)',
                    },
                  }}
                >
                  <LazyLoadImage
                    alt={label}
                    src={image}
                    effect="opacity"
                    style={{
                      height: '100px',
                      width: '100%',
                      borderRadius: '6px',
                      background: 'rgba(240, 240, 240, .8)',
                      objectFit: 'cover',
                      objectPosition: 'center',
                      '@media (maxWidth: 767px)': {
                        width: '100%',
                      },
                    }}
                    placeholder={
                      // eslint-disable-next-line react/jsx-wrap-multilines
                      <Skeleton
                        sx={{
                          height: '100px',
                          width: '100%',
                          borderRadius: '6px',
                          background: 'rgba(240, 240, 240, .8)',
                          marginTop: '4px',
                        }}
                        variant="rectangular"
                        animation="wave"
                      />
                    }
                  />
                  <Typography
                    sx={{
                      margin: 'auto',
                      ...(interestList.includes(value)
                        ? {
                          fontWeight: 700,
                        }
                        : {}),
                    }}
                  >
                    {label}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>

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
                height: '40px',
                borderRadius: '20px',
                mr: '4px',
              }}
              variant="outlined"
              onClick={onBack}
            >
              上一步
            </Button>
            <Button
              sx={{
                width: '100%',
                height: '40px',
                borderRadius: '20px',
                ml: '4px',
                color: '#ffff',
                bgcolor: '#16B9B3',
              }}
              variant="contained"
              onClick={onNext}
            >
              下一步
            </Button>
          </Box>
        </Box>
      </ContentWrapper>
    </Box>
  );
}

export default Step2;
