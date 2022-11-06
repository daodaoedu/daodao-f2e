import React, { useEffect, useMemo, useState } from 'react';
import styled from '@emotion/styled';
import { css } from '@emotion/react';
import { Tooltip } from '@mui/material';

const CardWrapper = styled.li`
  position: relative;
  width: 200px;
  height: 100px;
  flex: 0 0 200px;
  border-radius: 10px;
  margin: 5px;
  padding: 5px;
  color: #16b9b3;
  border: 2px #16b9b3 solid;
  overflow: hidden;

  cursor: pointer;
  object-fit: cover;
  &:hover {
    transform: scale(1.05);
    transition: transform 0.4s;
  }
`;

const ImageWrapper = styled.div`
  width: 40px;
  height: 40px;
  flex: 0 0 40px;
  background-color: #f5f5f5;
  ${({ image }) => css`
    background-image: ${`url(${image})`};
    background-size: cover;
    background-repeat: no-repeat;
    background-position: 50% 50%;
  `}
  border-radius: 10px;
  /* object-fit: cover; */
  /* opacity: 0; */

  @media (max-width: 767px) {
    border-radius: 10%;
  }
`;

const HeaderWrapper = styled.div`
  display: flex;
  justify-content: flex-start;
  align-items: center;
  h3 {
    margin-left: 10px;
    text-align: left;
    display: -webkit-box;
    text-overflow: ellipsis;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 1;
    overflow: hidden;
    white-space: pre-wrap;
    font-weight: bold;
  }
`;

const FooterWrapper = styled.div`
  p {
    text-align: left;
    display: -webkit-box;
    text-overflow: ellipsis;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    overflow: hidden;
    white-space: pre-wrap;
  }
`;

const Card = ({ image, title, desc }) => {
  return (
    <Tooltip title={desc}>
      <CardWrapper
        onClick={() =>
          open(`https://www.daoedu.tw/resource/${title}`, '_target')
        }
      >
        <HeaderWrapper>
          <ImageWrapper image={image} />
          <h3>{title}</h3>
        </HeaderWrapper>
        <FooterWrapper>
          <p>{desc}</p>
        </FooterWrapper>
      </CardWrapper>
    </Tooltip>
  );
};

export default Card;
