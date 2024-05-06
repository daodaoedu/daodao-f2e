import styled from '@emotion/styled';
import Button from '@mui/material/Button';

export const StyledGoBack = styled.div`
  display: inline-block;
  padding: 0 4px;
  margin-bottom: 10px;
  color: #536166;
  font-size: 14px;
  cursor: pointer;

  span {
    padding-left: 4px;
  }
`;

export const StyledHeading = styled.h1`
  margin-top: 8px;
  font-size: 22px;
  font-weight: 700;
  color: #536166;
`;

export const StyledContainer = styled.main`
  position: relative;
  padding-top: 60px;
  margin: 0 auto;
  width: 720px;

  @media (max-width: 760px) {
    padding: 20px;
    width: 100%;
  }
`;

export const StyledDesktopEditButton = styled(Button)`
  position: absolute;
  top: 0;
  right: 0;
  border-radius: 20px;

  @media (max-width: 767px) {
    display: none;
  }
`;

export const StyledMobileEditButton = styled(Button)`
  display: none;
  max-width: 316px;
  width: 100%;
  border-radius: 20px;

  @media (max-width: 767px) {
    display: block;
  }
`;
