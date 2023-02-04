import React from 'react';
import styled from '@emotion/styled';
import { Box } from '@mui/material';

const BannerImageWrapper = styled.div`
  position: absolute;
  width: 100%;
  overflow: hidden;
  z-index: -1;
  top: 0px;
  height: 60vh;
  /* @media (max-width: 768px) {
    height: 80vh;
  } */
`;

function BannerImage() {
  return (
    <BannerImageWrapper>
      <Box
        component="img"
        src="/assets/partner-banner.png"
        sx={{
          objectFit: 'cover',
          width: '100%',
          height: 'inherit',
          background: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(180px)',
        }}
      />
    </BannerImageWrapper>
  );
}

export default BannerImage;
