import { keyframes, css } from '@emotion/react';
import styled from '@emotion/styled';
import Link from 'next/link';

const appearFrames = keyframes`
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
`;

const slideInFrames = keyframes`
  0% {
    transform: translateX(-2%);
  }
  100% {
    transform: translateX(0);
  }
`;

const shrinkFrames = keyframes`
  0% {
    width: 95%;
  }
  100% {
    width: 90%;
  }
`;

const MenuItemWrapper = styled.li`
  animation: 1s ${appearFrames} forwards;
  ${(props) => css`
    animation-delay: ${props.delay};
  `}
`;

const ItemWrapper = styled.div`
  font-size: 30px;
  padding: 1rem 0;
  margin: 0 5%;
  cursor: pointer;
  color: #fafafa;
  transition: color 0.2s ease-in-out;
  animation: 0.5s ${slideInFrames} forwards;
  ${(props) => css`
    animation-delay: ${props.delay};
  `}
  &:hover {
    color: 'gray';
  }
`;

const LineStyle = styled.div`
  width: '90%';
  height: '1px';
  background: '#fafafa';
  margin: '0 auto';
  animation: 0.5s ${shrinkFrames} forwards;
  ${(props) => css`
    animation-delay: ${props.delay};
  `}
`;

const MenuItem = ({ delay, text, link, onClick }) => {
  if (link) {
    return (
      <MenuItemWrapper delay={delay} onClick={onClick}>
        <Link href={link} passHref>
          <ItemWrapper delay={delay}>{text}</ItemWrapper>
        </Link>
        <LineStyle delay={delay} />
      </MenuItemWrapper>
    );
  }
  return (
    <MenuItemWrapper delay={delay} onClick={onClick}>
      <ItemWrapper delay={delay}>{text}</ItemWrapper>
      <LineStyle delay={delay} />
    </MenuItemWrapper>
  );
};

export default MenuItem;
