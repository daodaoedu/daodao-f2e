import styled from '@emotion/styled';
import { css } from '@emotion/react';
import { useRouter } from 'next/router';
import { Box, Skeleton, Tooltip, Typography } from '@mui/material';
import dayjs from 'dayjs';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import { slideInUp } from '../../../../../shared/styles/animation';

const CardWrapper = styled.li`
  position: relative;
  width: 150px;
  height: 150px;
  flex: 0 0 150px;
  /* border-radius: 20px; */
  margin: 5px;
  /* padding: 10px; */
  color: #16b9b3;
  /* border: 2px #16b9b3 solid; */
  overflow: hidden;

  cursor: pointer;
  object-fit: cover;
  &:hover {
    transform: scale(1.05);
    transition: transform 0.4s;
  }
`;

const ContentWrapper = styled.p`
  display: flex;
  flex-direction: column;
  align-items: center;
  height: calc(90px - 20px);
  font-weight: 500;
  text-align: left;
  display: -webkit-box;
  text-overflow: ellipsis;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
  white-space: pre-wrap;
  font-size: 12px;
`;

const BackgroundWrapper = styled.div`
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  border-radius: 20px;
  z-index: -1;
  ${({ image }) => css`
    background-image: ${`url(${image})`};
    background-size: cover;
    background-repeat: no-repeat;
    background-position: 50% 50%;
    filter: brightness(50%);
  `}
`;
const ImageWrapper = styled(LazyLoadImage)`
  /* border-radius: 10px; */
  width: 150px;
  height: 150px;
  min-width: 150px;
  min-height: 150px;
  position: relative;
  object-fit: cover;
  object-position: center;
`;

const Card = ({ message = '', date, image, url }) => {
  return (
    <Tooltip title={message.slice(0, 150)}>
      <CardWrapper onClick={() => window.open(url, '_target')}>
        <ImageWrapper alt={message} src={image} effect="opacity" />
      </CardWrapper>
    </Tooltip>
  );
};

export default Card;
