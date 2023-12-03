import styled from '@emotion/styled';
import { Box } from '@mui/material';

export const StyledWrapper = styled.div`
  position: relative;
  margin: 70px auto 0;
  width: 100%;
  max-width: 1024px;
  min-height: 100vh;
  margin-top: -80px;

  @media (max-width: 900px) {
    padding: 0 16px;
    margin-top: -50px;
  }
`;
export const StyledContent = styled(Box)`
  margin-top: 24px;
  padding: 32px 40px;
  background-color: #fff;
  border-radius: 20px;
  @media (max-width: 900px) {
    padding: 0;
    background-color: transparent;
  }
`;

export const StyledSearchWrapper = styled(Box)`
  margin-top: 24px;
`;
