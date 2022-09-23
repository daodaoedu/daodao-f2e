import styled from '@emotion/styled';
import { css } from '@emotion/react';
import { useRouter } from 'next/router';
import { Box, Tooltip, Typography } from '@mui/material';
import dayjs from 'dayjs';
import { slideInUp } from '../../../../../shared/styles/animation';

const CardWrapper = styled.li`
  position: relative;
  width: 200px;
  height: 120px;
  flex: 0 0 200px;
  border-radius: 20px;
  margin: 5px;
  padding: 10px;
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

const Card = ({ id, message = '', date, title, link, type }) => {
  const router = useRouter();
  return (
    <Tooltip title={message.slice(0, 150)}>
      <CardWrapper
        onClick={() =>
          window.open(
            `https://www.facebook.com/${id.split('_')[0]}/posts/${
              id.split('_')[1]
            }`,
            '_target',
          )
        }
      >
        <Box
          sx={{
            // border: "1px solid #16b9b3",
            // borderRadius: '10px'
            fontWeight: 'bold',
          }}
        >
          {/* {title} */}
          時間：{dayjs(date).format('YYYY/MM/DD')}
        </Box>
        <ContentWrapper>{message}</ContentWrapper>
        {/* <Typography sx={{ color: "#16b9b3" }}>{message}</Typography> */}
      </CardWrapper>
    </Tooltip>
  );
};

export default Card;
