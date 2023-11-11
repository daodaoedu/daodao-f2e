import styled from '@emotion/styled';

export const StyledLabel = styled.span`
  flex-basis: 50px;
  color: #293a3d;
  font-size: 12px;
  font-weight: bold;
`;

export const StyledText = styled.span`
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
`;

export const StyledInfo = styled.div`
  > div {
    display: flex;
    gap: 4px;
  }
`;

export const StyledFooter = styled.footer`
  display: flex;
  justify-content: space-between;
  align-items: center;

  time,
  div {
    font-size: 12px;
  }

  time {
    font-weight: 300;
    color: #92989a;
  }

  div {
    --bg-color: #def5f5;
    --color: #16b9b3;
    display: flex;
    align-items: center;
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

    &.end {
      --bg-color: #f3f3f3;
      --color: #92989a;
    }
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

export const StyledGroupCard = styled.div`
  position: relative;
  background: #fff;
  padding: 0.5rem;
  transition: transform 0.15s, box-shadow 0.15s;
  border-radius: 4px;

  &:hover {
    z-index: 1;
    transform: scale(1.0125);
    box-shadow: 0 0 6px 2px #0001;
  }

  img {
    vertical-align: middle;
  }
`;
