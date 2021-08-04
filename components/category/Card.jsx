import React, { useMemo } from 'react';
import { css, keyframes } from '@emotion/react';
import styled from '@emotion/styled';

const loadingFrames = keyframes`
  0% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0 50%;
  }
`;

const CardWrapper = styled.li`
    border-radius: 10px;
    width: 260px;
    height: 320px;
    overflow: hidden;
    cursor: pointer;
    border: 1px solid #AAAAAA;
    background-color: #ffffff;
`;

// const defaultImage = 'https://images.unsplash.com/photo-1564410267841-915d8e4d71ea?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=668&q=80';

const ContentWrapper = styled.div`
    height: 260px;
    background-image: url(${(props) => (typeof (props.image) === 'string' && props?.image?.includes('http') ? props.image : '/preview.webp')});
    background-size: cover;
    background-repeat: no-repeat;
    background-position: 50% 50%;
    ${(props) => props.isLoading && css`
    -webkit-animation: ${loadingFrames} 1.4s ease infinite; 
      animation: ${loadingFrames} 1.4s ease infinite;
      background: -webkit-gradient(linear, left top, right top, color-stop(25%, rgba(190, 190, 190, 0.2)), color-stop(37%, rgba(129, 129, 129, 0.24)), color-stop(63%, rgba(190, 190, 190, 0.2)));
      background: linear-gradient(90deg, rgba(190, 190, 190, 0.2) 25%, rgba(129, 129, 129, 0.24) 37%, rgba(190, 190, 190, 0.2) 63%);
      background-size: 400% 100%;
    `}
`;

const FooterWrapper = styled.div`
    display: flex;
    align-items: center;
    height: 60px;
    padding-left: 20px;
    font-weight: 500;
    border-top: 1px solid #AAAAAA;
    /* 
      Footer loading 效果
      -webkit-animation: ${loadingFrames} 1.4s ease infinite; 
      animation: ${loadingFrames} 1.4s ease infinite;
      background: -webkit-gradient(linear, left top, right top, color-stop(25%, rgba(190, 190, 190, 0.2)), color-stop(37%, rgba(129, 129, 129, 0.24)), color-stop(63%, rgba(190, 190, 190, 0.2)));
      background: linear-gradient(90deg, rgba(190, 190, 190, 0.2) 25%, rgba(129, 129, 129, 0.24) 37%, rgba(190, 190, 190, 0.2) 63%);
      background-size: 400% 100%; */
`;

const Card = ({
  name, image, onClick, isLoading,
}) => {
  const footerName = useMemo(() => (isLoading ? '' : name), [name, isLoading]);
  return (
    <CardWrapper onClick={onClick}>
      <ContentWrapper image={image} isLoading={isLoading} />
      <FooterWrapper>
        {footerName}
      </FooterWrapper>
    </CardWrapper>
  );
};

export default Card;
