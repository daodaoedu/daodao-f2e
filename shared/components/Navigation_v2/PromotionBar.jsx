import { useState, useEffect } from 'react';
import styled from '@emotion/styled';

const PromotionBarWrapper = styled.div`
  width: 100%;
  position: fixed;
  top: 0;
  padding-bottom: 20px;
  background-color: #f37b5f;
  color: #fff;
  padding: 7px;
  text-align: center;
  font-size: 16px;

  a:hover {
    text-decoration: underline;
    text-underline-offset: 3px;
  }
`;

const CloseButton = styled.span`
  position: absolute;
  top: 9px;
  right: 7px;
  width: 20px;
  height: 20px;
  opacity: 0.3;
  cursor: pointer;

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
    background-color: #333;
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
          <a href={link} target="_blank" rel="noreferrer">
            {text}
          </a>
          <CloseButton onClick={() => toggleAction(false)} />
        </PromotionBarWrapper>
      )}
    </>
  );
};

export default PromotionBar;
