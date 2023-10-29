import React from 'react';
import styled from '@emotion/styled';
import { Box, Grid, Typography } from '@mui/material';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';

import PartnerList from './PartnerList';
import SearchField from './SearchField';
import Banner from './Banner';

const PartnerWrapper = styled.div`
  min-height: 100vh;
  background-color: transparent;
  z-index: 100;
  margin-top: -150px;
  position: relative;
`;

const PartnerContent = styled(Box)`
  margin-top: 24px;
  padding: 32px 40px;
  background-color: #fff;
  border-radius: 20px;
`;

const TagWrapper = styled(Box)`
  border-radius: 13px;
  display: flex;
  padding: 3px 7px 3px 10px;
  justify-content: center;
  align-items: center;
  background: #16b9b3;
`;

const TagText = styled(Typography)`
  color: var(--black-white-white, #fff);
  text-align: center;
  font-family: 'Noto Sans TC';
  font-size: 14px;
  font-style: normal;
  font-weight: 400;
  line-height: 1.4;
`;

const SearchParamerters = () => (
  <Grid container gap={'10px'} mb={'16px'}>
    <Grid item>
      <TagWrapper>
        <TagText>台北市</TagText>
        <CloseOutlinedIcon
          style={{ padding: '2px', fontSize: '16px', color: 'white' }}
        />
      </TagWrapper>
    </Grid>
    <Grid item>
      <TagWrapper>
        <TagText>桃園市</TagText>
        <CloseOutlinedIcon
          style={{ padding: '2px', fontSize: '16px', color: 'white' }}
        />
      </TagWrapper>
    </Grid>
  </Grid>
);

function Partner() {
  return (
    <>
      <Banner />
      <PartnerWrapper>
        <Box
          sx={{
            padding: '0 10%',
          }}
        >
          <Box
            sx={{
              marginTop: '24px',
              borderRadius: '20px',
              boxShadow: '0px 4px 6px rgba(196, 194, 193, 0.2)',
              padding: '40px',
              zIndex: 2,
              background: '#fff',
            }}
          >
            <SearchField />
          </Box>
          <PartnerContent>
            <SearchParamerters />
            <PartnerList />
          </PartnerContent>
        </Box>
      </PartnerWrapper>
    </>
  );
}

export default Partner;
