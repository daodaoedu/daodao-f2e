import React from 'react';
import styled from '@emotion/styled';
import { Box } from '@mui/material';

const BannerImageWrapper = styled.div`
  position: absolute;
  width: 100%;
  overflow: hidden;
  z-index: -1;
  top: 80px;
  height: 60vh;
  /* @media (max-width: 768px) {
    height: 80vh;
  } */
`;

const BannerImage = () => {
  return (
    <BannerImageWrapper>
      <Box
        component="img"
        src="/assets/images/partner-banner.png"
        sx={{
          objectFit: 'cover',
          width: '100%',
          height: 'inherit',
          background: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(180px)',
          zIndex: 1,
        }}
      />
    </BannerImageWrapper>
  );
};

export default BannerImage;
