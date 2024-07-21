import styled from '@emotion/styled';
import Link from 'next/link';

export const StyledLabel = styled.span`
  flex-basis: 50px;
  color: #293a3d;
  font-size: 12px;
  font-weight: bold;
`;

export const StyledText = styled.div`
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: ${(props) => props.lineClamp || '1'};
  overflow: hidden;
  color: ${(props) => props.color || '#536166'};
  font-size: ${(props) => props.fontSize || '12px'};
`;

export const StyledTitle = styled.h2`
  font-size: 14px;
  font-weight: bold;
  line-height: 1.4;
  display: -webkit-box;
  color: #293a3d;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 1;
  overflow: hidden;
`;

export const StyledInfo = styled.div`
  ${StyledLabel} {
    margin-right: 5px;
    padding-right: 5px;
    border-right: 1px solid #536166;
  }
`;

export const StyledFooter = styled.footer`
  display: flex;
  justify-content: space-between;
  align-items: center;

  time {
    font-size: 12px;
    font-weight: 300;
    color: #92989a;
  }
`;

export const StyledStatus = styled.div`
  --bg-color: #def5f5;
  --color: #16b9b3;
  display: flex;
  align-items: center;
  width: max-content;
  font-size: 12px;
  padding: 4px 10px;
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
  padding: 10px;
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

export const StyledAreas = styled.div`
  display: flex;
  align-items: center;
`;

export const StyledGroupCard = styled(Link)`
  display: block;
  position: relative;
  background: #fff;
  padding: 0.5rem;
  border-radius: 4px;

  img {
    vertical-align: middle;
  }
`;
