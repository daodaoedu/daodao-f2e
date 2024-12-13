import { useState, useEffect } from 'react';
import styled from '@emotion/styled';
import Link from 'next/link';

const TextContainer = styled.div`
  .fade-text {
    opacity: 0;
    animation: fade-in-out 5s linear infinite;
  }

  @keyframes fade-in-out {
    0% {
      opacity: 0;
    }
    10% {
      opacity: 1;
    }
    90% {
      opacity: 1;
    }
    100% {
      opacity: 0;
    }
  }
`;

const PromotionBarWrapper = styled.div`
  width: 100%;
  top: 0;
  padding-bottom: 20px;
  background-color: #FE9D35;
  color: #fff;
  padding: 10px 12% 10px 5%;
  text-align: center;
  font-size: 16px;
  a:hover {
    text-decoration: underline;
    text-underline-offset: 3px;
  }

  @media (max-width: 767px) {
    min-height: 68px;
    /* flex-direction: column; */
  }

`;

const CloseButton = styled.span`
  position: absolute;
  top: calc(50% - 54px);
  right: 5%;
  width: 20px;
  height: 20px;
  opacity: 1;
  cursor: pointer;
  transform: translateY(50%);
  &:hover {
    opacity: 1;
  }

  &:before,
  &:after {
    position: absolute;
    left: 10px;
    content: ' ';
    height: 20px;
    width: 2px;
    background-color: #fff;
  }

  &:before {
    transform: rotate(45deg);
  }

  &:after {
    transform: rotate(-45deg);
  }
`;

const PromotionBar = ({ isShow, link, text, toggleAction }) => {
  return (
    <>
      {isShow && (
        <PromotionBarWrapper>
          <Link href="/learning-marathon">
            <TextContainer>
              <span className="fade-text">
                {text}
              </span>
            </TextContainer>
          </Link>
          <CloseButton onClick={() => toggleAction(false)} />
        </PromotionBarWrapper>
      )}
    </>
  );
};

export default PromotionBar;
