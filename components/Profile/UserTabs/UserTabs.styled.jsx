import styled from '@emotion/styled';
import { Box } from '@mui/material';

export const StyledTabContextBox = styled(Box)(({ theme }) => ({
  borderBottom: '1px solid #536166',
  color: theme.secondary, // Assuming secondary is a valid theme property
  borderColor: theme.secondary, // Use borderColor for indicator color
  '@media (max-width: 767px)': {
    width: '100%',
  },
}));

export const StyledPanelBox = styled(Box)`
  width: 720px;
  padding: 40px 30px;
  margin-top: '10px';
  @media (max-width: 767px) {
    width: 100%;
    padding: 30px;
  }
`;

export const StyledPanelText = styled(Box)`
  display: flex;
  p {
    color: #293a3d;
    font-weight: 500;
    white-space: nowrap;
    min-width: 50px;
  }
  span {
    color: #536166;
    font-size: 14px;
    font-style: normal;
    font-weight: 400;
    line-height: 140%;
    margin-left: 12px;
    display: grid;
    place-items: center;
  }
  @media (max-width: 767px) {
    flex-direction: column;
    span {
      margin-left: 0px;
    }
  }
`;
