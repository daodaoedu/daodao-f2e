import Link from 'next/link';
import styled from '@emotion/styled';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';

export const StyledText = styled.div`
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: ${(props) => props.lineClamp || '1'};
  overflow: hidden;
  color: ${(props) => props.color || '#536166'};
  font-size: ${(props) => props.fontSize || '14px'};
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

export const StyledFooter = styled.footer`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

export const StyledTime = styled.time`
  font-size: 12px;
  font-weight: 300;
  color: #92989a;
`;

export const StyledFlex = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
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

export const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  flex: 1;
  padding: 0 10px;
`;

export const StyledAreas = styled.div`
  padding: 4px 0;
  display: flex;
  align-items: center;
`;

export const StyledGroupCard = styled(Link)`
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

export const StyledMenuItem = styled(MenuItem)`
  min-width: 146px;
`;

export const StyledDivider = styled(Divider)`
  width: 100%;
  color: #000;
  margin: 30px 0;
  height: 2px;
`;
