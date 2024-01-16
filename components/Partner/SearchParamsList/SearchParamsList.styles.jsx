import styled from '@emotion/styled';
import { Box, Grid, Typography } from '@mui/material';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';

export const StyledGrid = styled(Grid)`
  flex-wrap: nowrap;
  overflow-x: auto;

  -ms-overflow-style: none; /* IE */
  scrollbar-width: none; /* Firefox */
  scroll-behavior: smooth;

  &::-webkit-scrollbar {
    display: none; /* Chrome, Safari, Edge and Opera */
  }
`;
export const StyledGridItem = styled(Grid)`
  flex: 0 0 auto;
`;

export const StyledTag = styled(Box)`
  border-radius: 13px;
  display: flex;
  flex-wrap: nowrap;
  overflow-x: auto;
  padding: 5px 7px 5px 10px;
  justify-content: center;
  align-items: center;
  background: #16b9b3;
`;

export const StyledTagText = styled(Typography)`
  color: #fff;
  text-align: center;
  font-family: 'Noto Sans TC';
  font-size: 14px;
  font-style: normal;
  font-weight: 400;
  line-height: 1.4;
  margin-right: 2px;
`;

export const StyledClosed = styled(CloseOutlinedIcon)`
  cursor: pointer;
  padding: 2px;
  font-size: 16px;
  color: white;
  border-radius: 50%;
  &:hover {
    background-color: #def5f5;
    color: #16b9b3;
  }
`;
