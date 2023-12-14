import styled from '@emotion/styled';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import { Grid, Box, Typography } from '@mui/material';

export const StyledCard = styled(Box)`
  display: flex;
  padding: 12px;
  background-color: #fff;
  justify-content: space-between;
  align-items: flex-start;
  width: 100%;
  border-radius: 20px;
  cursor: pointer;
  &:hover {
    box-shadow: 0px 4px 10px 0px rgba(196, 194, 193, 0.4);
    h2 {
      color: #16b9b3;
    }
  }
`;

export const StyledCardContainer = styled(Box)`
  width: 100%;
`;

export const StyledImage = styled(LazyLoadImage)`
  display: block;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: rgba(240, 240, 240, 0.8);
  object-fit: cover;
  object-position: center;
`;

export const StyledCardTitle = styled.h2`
  color: #293a3d;
  font-weight: 500;
  font-size: 16px;
  margin-right: 5px;
`;

export const StyledCardLabel = styled(Typography)`
  color: var(--black-white-gray-dark, #293a3d);
  text-align: center;
  font-family: Noto Sans TC;
  font-size: 14px;
  font-style: normal;
  font-weight: 400;
  line-height: 140%;
  border-radius: 4px;
  background: #f3f3f3;
  padding: 3px 10px;
`;

export const StyledCardSubtitle = styled(Typography)`
  color: #92989a;
  font-weight: 400;
  font-size: 14px;
`;

export const StyledTypoCaption = styled(Typography)`
  color: #92989a;
  font-family: 'Noto Sans TC';
  font-size: 12px;
  font-style: normal;
  line-height: 1.4;
`;

export const StyledTagContainer = styled(Grid)`
  display: flex;
  align-items: center;
`;

export const StyledTagText = styled(Grid)`
  color: var(--black-white-gray, #536166);
  text-align: center;
  font-family: 'Noto Sans TC';
  font-size: 12px;
  font-style: normal;
  line-height: 1.4;
  border-radius: 13px;
  padding: 3px 10px;
  display: flex;
  justify-content: center;
  background: #def5f5;
`;

export const StyledTypoEllipsis = styled(Box)`
  display: block;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const FlexSBAlignCenter = styled(Box)`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

export const FlexAlignCenter = styled(Box)`
  display: flex;
  align-items: center;
`;

export const FlexColCenterSB = styled(Box)`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: space-between;
`;
