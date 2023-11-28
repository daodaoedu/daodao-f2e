import React from 'react';
import { useSelector } from 'react-redux';
import styled from '@emotion/styled';
import { Box, Grid, Typography, Button } from '@mui/material';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import useMediaQuery from '@mui/material/useMediaQuery';
import PartnerList from './PartnerList';
import SearchField from './SearchField';
import Banner from './Banner';

const StyledWrapper = styled.div`
  min-height: 100vh;
  background-color: transparent;
  z-index: 100;
  margin-top: -150px;
  position: relative;
  padding: 0 10%;
  @media (max-width: 767px) {
    padding: 0 16px;
  }
`;
const StyledContent = styled(Box)`
  margin-top: 24px;
  padding: 32px 40px;
  background-color: #fff;
  border-radius: 20px;
  @media (max-width: 767px) {
    padding: 0;
    background-color: transparent;
  }
`;

const StyledSearchWrapper = styled(Box)`
  margin-top: 24px;
  border-radius: '20px';
  box-shadow: 0px 4px 6px rgba(196, 194, 193, 0.2);
  padding: 40px;
  z-index: 2;
  background: #fff;
`;

const StyledTagWrapper = styled(Box)`
  border-radius: 13px;
  display: flex;
  padding: 3px 7px 3px 10px;
  justify-content: center;
  align-items: center;
  background: #16b9b3;
`;

const StyledTagText = styled(Typography)`
  color: #fff;
  text-align: center;
  font-family: 'Noto Sans TC';
  font-size: 14px;
  font-style: normal;
  font-weight: 400;
  line-height: 1.4;
`;

const SearchParamsList = ({ params }) =>
  params.length > 0 && (
    <Grid container gap={'10px'} mb={'16px'}>
      {params.map((param, idx) => (
        <Grid item key={param + idx}>
          <StyledTagWrapper>
            <StyledTagText>{param}</StyledTagText>
            <CloseOutlinedIcon
              style={{ padding: '2px', fontSize: '16px', color: 'white' }}
            />
          </StyledTagWrapper>
        </Grid>
      ))}
    </Grid>
  );

function Partner() {
  const mobileScreen = useMediaQuery('(max-width: 767px)');
  const partners = useSelector((state) => state.partners);

  return (
    <>
      <Banner />
      <StyledWrapper>
        <StyledSearchWrapper>
          <SearchField sx={{ mb: '12px' }} />
        </StyledSearchWrapper>
        <StyledContent>
          <SearchParamsList params={['台北市', '桃園市']} />
          <PartnerList />
        </StyledContent>
        {partners.items.length && (
          <Box
            sx={
              mobileScreen
                ? { textAlign: 'center', padding: '32px 0 80px' }
                : { textAlign: 'center', padding: '72px 0 100px' }
            }
          >
            <Button
              variant="outlined"
              sx={{
                fontSize: '16px',
                color: '#536166',
                borderColor: '#16B9B3',
                borderRadius: '20px',
                padding: '6px 48px',
              }}
            >
              顯示更多
            </Button>
          </Box>
        )}
      </StyledWrapper>
    </>
  );
}

export default Partner;
