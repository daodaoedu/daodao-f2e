import styled from '@emotion/styled';
import {
  Box,
  Typography,
  Button,
  InputBase,
  TextareaAutosize
} from '@mui/material';

export const MarathonSignUpWrapper = styled(Box)`
min-height: 100vh;
padding-bottom: 80px;
`;

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
  width: 737px;
  max-width: 100%;

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

  border: 1px solid #DBDBDB;
  
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
export const StyledMemo = styled.p`
  font-weight: 400;
  font-size: 14px;
  line-height: 140%;
  text-align: center;
  color: #536166;
  margin-top: 8px;
`;
export const StyledSection = styled(Box)`
  background-color: #ffffff;
  padding: 40px;
  width: 100%;
  border-radius: 16px;
  border: 1px solid #DBDBDB;

  &.error {
    border-color: #EF5364;
  }

  @media (max-width: 767px) {
    padding: 32px 16px;
  }

`;

export const StyledGroup = styled(Box)`
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  margin-top: ${({ mt = '20' }) => `${mt}px`};
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
  width: 737px;
  max-width: 100%;
  display: flex;
  gap: 8px;

  @media (max-width: 767px) {
    width: 100%;
  }
`;

export const StyledButton = styled(Button)(({ variant = 'contained' }) => ({
  ...(variant === 'contained' && {
    color: '#ffffff',
    backgroundColor: '#16b9b3',
  }),
  width: '100%',
  height: '40px',
  borderRadius: '20px',
}));

export const StyledInputBase = styled(InputBase)`
  width: 100%;
  border: 1px solid #DBDBDB;
  background-color: #FFF;
  border-radius: 8px;
  padding: 12px 16px;
  box-sizing: border-box;

  &.Mui-focused {
    border: 2px solid #16B9B3;
    padding: 11px 15px;
  }

  .MuiInputBase-input {
    padding: 0;
    line-height: 140%;
  }

  &.milestone.Mui-focused {
    border-width: 1px;
    padding: 12px 16px;
  }

  &.error {
    border-color: #EF5364;
    outline-color: #EF5364;
    position: relative;
  }
`;
export const StyledTextareaAutosize = styled(TextareaAutosize)`
  width: 100%;
  padding: 12px 16px;
  width: 100%;
  min-height:100px;
  border-radius: 8px;
  border: 1px solid #DBDBDB;

  &:focus, &:focus-visible {
    border: 2px solid #16B9B3;
    padding: 11px 15px;
    outline-color: #16B9B3;

    &.error {
      border-color: #EF5364;
      outline-color: #EF5364;
    }
  }
  
  .MuiInputBase-input {
    padding: 0;
    line-height: 140%;
  }

  &.error {
    border-color: #EF5364;
    outline-color: #16B9B3;
  }
`;
