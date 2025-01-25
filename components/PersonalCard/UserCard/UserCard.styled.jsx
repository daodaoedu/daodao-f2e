import styled from '@emotion/styled';
import { Box, Typography } from '@mui/material';

export const StyledProfileWrapper = styled(Box)`
  width: 100%;
  padding: 30px;
  background-color: #fff;
  border-radius: 20px;
  @media (max-width: 767px) {
    width: 100%;
    padding: 16px;
  }
`;

export const StyledProfileBaseInfo = styled(Box)`
  display: flex;
  justify-content: flex-start;
  align-items: center;
`;

export const StyledProfileTitle = styled(Box)`
  div {
    display: flex;
    align-items: center;
  }
  h2 {
    color: #536166;
    font-size: 18px;
    font-style: normal;
    font-weight: 700;
    line-height: 120%;
    margin-right: 10px;
  }
  span {
    border-radius: 4px;
    background: #f3f3f3;
    padding: 3px 10px;
  }
  p {
    color: #92989a;
    font-size: 14px;
    font-style: normal;
    font-weight: 400;
    line-height: 140%; /* 19.6px */
  }
`;

export const StyledProfileLocation = styled(Typography)`
  margin-top: 12px;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  color: #536166;
  font-size: 12px;
  font-style: normal;
  font-weight: 500;
  line-height: 140%; /* 16.8px */
`;

export const StyledProfileTag = styled(Box)`
  margin-top: 24px;
  display: flex;
  flex-wrap: wrap;
`;

export const StyledProfileOther = styled(Box)`
  margin-top: 24px;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  @media (max-width: 767px) {
    flex-direction: column;
    align-items: flex-start;
  }
`;

export const StyledProfileSocial = styled.ul`
  display: flex;
  align-items: center;
  flex-direction: column;
  align-items: flex-start;
  li {
    align-items: center;
    display: flex;
    margin-right: 16px;
    margin-bottom: 8px;
  }
  li:last-of-type {
    margin-bottom: 0;
  }
  li svg {
    color: #16b9b3;
  }
  li p,
  li a {
    margin-left: 5px;
    color: #293a3d;
    font-size: 12px;
    font-style: normal;
    font-weight: 400;
    line-height: 140%;
  }

  li a {
    color: #16b9b3;
    cursor: pointer;
    text-decoration: underline;
  }
`;

export const StyledProfileDate = styled.p`
  font-size: 12px;
  color: #92989a;
  font-weight: 400;
  line-height: 140%;
  @media (max-width: 767px) {
    width: 100%;
    text-align: right;
  }
`;
