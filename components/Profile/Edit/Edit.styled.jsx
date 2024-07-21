import styled from '@emotion/styled';
import { Box, Typography, Button } from '@mui/material';

export const FormWrapper = styled.form`
  --section-height: calc(100vh - 80px);
  --section-height-offset: 80px;
`;

export const ContentWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  border-radius: 16px;
  margin: 0 auto;
  width: 672px;
  @media (max-width: 767px) {
    width: 100%;
    .title {
      text-overflow: ellipsis;
      width: 100%;
    }
  }
`;

export const StyledTitleWrap = styled(Box)`
  background-color: #ffffff;
  padding: 5%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100%;
  border-radius: 16px;
  h2 {
    font-weight: 700;
    font-size: 22px;
    line-height: 140%;
    text-align: center;
    color: #536166;
  }
  .title-memo {
    font-weight: 700;
    font-size: 14px;
    line-height: 140%;
    text-align: center;
    color: #536166;
    margin-top: 8px;
  }
`;

export const StyledSection = styled(Box)`
  background-color: #ffffff;
  padding: 40px;
  margin-top: 16px;
  width: 100%;
  border-radius: 16px;
  @media (max-width: 767px) {
    padding: 32px 16px;
  }
`;

export const StyledGroup = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  margin-top: ${({ mt = '20' }) => `${mt}px`};
  input {
    padding: 17px 16px 12px;
  }
`;

export const StyledSelectWrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  margin-top: 10px;
`;

export const StyledSelectText = styled(Typography)`
  margin: auto;
  font-weight: ${({ isselected }) =>
    isselected === 'true' ? '700' : 'normal'};
`;

export const StyledSelectBox = styled(Box)`
  border: 1px solid #dbdbdb;
  border-radius: 8px;
  padding: 10px;
  width: ${({ col = '3' }) => `calc(calc(100% - 16px) / ${col})`};
  display: flex;
  justify-items: center;
  align-items: center;
  cursor: pointer;
  background-color: ${({ isselected }) =>
    isselected === 'true' ? '#DEF5F5' : 'initial'};
  border: ${({ isselected }) =>
    isselected === 'true' ? '1px solid #16B9B3' : '1px solid #DBDBDB'};
  margin-bottom: 12px;
`;

export const StyledToggleWrapper = styled(Box)`
  border: 1px solid #dbdbdb;
  border-radius: 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 13px 16px;
`;

export const StyledToggleText = styled(Typography)`
  font-weight: 500;
  font-size: 16px;
  line-height: 140%;
  color: #293a3d;
`;

export const StyledButtonGroup = styled(Box)`
  margin-top: 24px;
  width: 100%;
  display: flex;
`;

export const StyledButton = styled(Button)(({ variant = 'contained' }) => ({
  ...(variant === 'contained' && {
    color: '#ffffff',
    backgroundColor: '#16b9b3',
  }),
  width: '100%',
  height: '40px',
  borderRadius: '20px',
  marginRight: '8px',
}));
