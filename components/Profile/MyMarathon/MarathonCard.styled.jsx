import styled from '@emotion/styled';
import {
  Box,
  MenuItem
} from '@mui/material';

export const StyledGroupsWrapper = styled.div`
  background-color: #ffffff;
  max-width: 672px;
  border-radius: 16px;
  padding: 36px 40px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  @media (max-width: 767px) {
    padding: 16px 20px;
  }

  ${(props) => props.sx}
`;
export const StyledGroupCard = styled(Box)`
  width: 100%;
  display: flex;
  position: relative;
  background: #fff;
  border-radius: 4px;
  gap: 16px;

  @media (max-width: 767px) {
    flex-direction: column;
  }
`;

export const StyledImageWrapper = styled.div`
  flex: 1;
  overflow: hidden;

  img {
    vertical-align: middle;
  }
`;
export const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  flex: 1;
  padding: 0 10px;
`;

export const StyledTitle = styled.h2`
  font-size: 16px;
  font-weight: bold;
  line-height: 1.6;
  margin-bottom: 4px;
  display: -webkit-box;
  color: #293a3d;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 1;
  overflow: hidden;
`;
export const StyledText = styled.div`
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: ${(props) => props.lineClamp || '1'};
  overflow: hidden;
  color: ${(props) => props.color || '#536166'};
  font-size: ${(props) => props.fontSize || '14px'};
  word-break: break-word;
`;
export const StyledFooter = styled.footer`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

export const StyledFlex = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
`;

export const StyledStatus = styled.div`
  --bg-color: #def5f5;
  --color: #16b9b3;
  display: flex;
  align-items: center;
  width: max-content;
  font-size: 12px;
  padding: 4px 10px;
  height: 24px;
  background: var(--bg-color);
  color: var(--color);
  border-radius: 4px;
  font-weight: 500;
  gap: 4px;
  margin-right: auto;
  &::before {
    content: '';
    display: block;
    width: 8px;
    height: 8px;
    background: var(--color);
    border-radius: 50%;
  }

  &.finished {
    --bg-color: #f3f3f3;
    --color: #92989a;
  }
`;
export const StyledMenuItem = styled(MenuItem)`
  min-width: 146px;
`;
