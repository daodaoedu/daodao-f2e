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
  font-size: 18px;
  padding: 12px 24px;
  border-radius: 8px;
  cursor: pointer;
  transition: color 0.2s ease-in-out;
  animation: 0.5s ${slideInFrames} forwards;
  color: #536166;
  ${(props) => css`
    animation-delay: ${props.delay};
  `}
  &:hover {
    background-color: #def5f5;
    font-weight: bold;
  }
`;

const MenuItem = ({ delay, text, link, onClick }) => {
  return (
    <MenuItemWrapper delay={delay} onClick={onClick}>
      {link ? (
        <Link href={link} passHref color="gray">
          <ItemWrapper delay={delay}>{text}</ItemWrapper>
        </Link>
      ) : (
        <ItemWrapper delay={delay}>{text}</ItemWrapper>
      )}
    </MenuItemWrapper>
  );
};

export default MenuItem;
