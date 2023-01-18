import React, { useRef } from 'react';
import styled from '@emotion/styled';
import { Box, Typography, Divider, Skeleton } from '@mui/material';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import Banner from './Banner';
import SearchField from './SearchField';
import PartnerList from './PartnerList';

const PartnerWrapper = styled.div`
  min-height: 100vh;
`;

const Partner = () => {
  const guideRef = useRef(null);
  return (
    <PartnerWrapper>
      <Banner guideRef={guideRef} />
      <Box
        sx={{
          marginTop: '-60px',
          padding: '0 10%',
        }}
      >
        <Box
          sx={{
            background: '#FFFFFF',
            boxShadow: '0px 4px 6px rgba(196, 194, 193, 0.2)',
            borderRadius: '20px',
            padding: '40px',
          }}
        >
          <SearchField />
        </Box>
        <PartnerList />
      </Box>
    </PartnerWrapper>
  );
};

export default Partner;
