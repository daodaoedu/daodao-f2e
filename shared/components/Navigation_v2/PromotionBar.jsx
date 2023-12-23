import { useState, useEffect } from 'react';
import styled from '@emotion/styled';

const PromotionBarWrapper = styled.div`
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
  top: 7px;
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

const PromotionBar = ({ link, text }) => {
  const [show, setShow] = useState(undefined);

  useEffect(() => {
    setShow(true);
  }, []);

  const handleClose = () => {
    setShow(false);
  };

  return (
    <>
      {show && (
        <PromotionBarWrapper>
          <a href={link} target="_blank" rel="noreferrer">
            {text}
          </a>
          <CloseButton onClick={handleClose} />
        </PromotionBarWrapper>
      )}
    </>
  );
};

export default PromotionBar;
