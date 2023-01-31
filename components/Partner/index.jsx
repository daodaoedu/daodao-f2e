import React from 'react';
import styled from '@emotion/styled';
import { Box } from '@mui/material';
import Banner from './Banner';
import SearchField from './SearchField';
import PartnerList from './PartnerList';

const PartnerWrapper = styled.div`
  min-height: 100vh;
  background-color: transparent;
  z-index: 100;
  margin-top: -150px;
`;

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
          <Box
            sx={{
              marginTop: '24px',
              borderRadius: '20px',
              boxShadow: '0px 4px 6px rgba(196, 194, 193, 0.2)',
              background: '#fff',
            }}
          >
            <PartnerList />
          </Box>
        </Box>
      </PartnerWrapper>
    </>
  );
}

export default Partner;
