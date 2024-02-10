import styled from '@emotion/styled';
import InputLabel from '@mui/material/InputLabel';

export const StyledHeading = styled.h1`
  margin-bottom: 8px;
  text-align: center;
  font-size: 22px;
  font-weight: 700;
  color: #536166;
`;

export const StyledDescription = styled.p`
  margin-bottom: 40px;
  text-align: center;
  font-size: 14px;
  font-weight: 400;
  color: #536166;
`;

export const StyledContainer = styled.main`
  position: relative;
  margin: 0 auto;
  width: 720px;

  @media (max-width: 760px) {
    padding: 20px;
    width: 100%;
  }
`;

export const StyledLabel = styled(InputLabel)`
  display: block;
  margin-bottom: 8px;
  font-size: 16px;
  font-weight: 500;
  color: #293a3d;
`;

export const StyledGroup = styled.div`
  margin-bottom: 20px;
`;
