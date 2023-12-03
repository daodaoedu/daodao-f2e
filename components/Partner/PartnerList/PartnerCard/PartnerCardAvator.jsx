import React from 'react';
import { Skeleton } from '@mui/material';
import { StyledImage } from './PartnerCard.styled';

const PartnerCardAvator = ({ image }) => {
  return image ? (
    <StyledImage src={image} alt="avatar" effect="opacity" />
  ) : (
    <Skeleton
      sx={{
        height: '50px',
        width: '50px',
        background: 'rgba(240, 240, 240, .8)',
        marginTop: '4px',
      }}
      variant="circular"
      animation="wave"
    />
  );
};

export default PartnerCardAvator;
