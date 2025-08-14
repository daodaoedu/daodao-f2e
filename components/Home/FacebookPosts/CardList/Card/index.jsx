import styled from '@emotion/styled';
import { Box, Tooltip } from '@mui/material';
import { format } from 'date-fns';

const CardWrapper = styled.li`
  position: relative;
  width: 200px;
  height: 120px;
  flex: 0 0 200px;
  border-radius: 12px;
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

const Card = ({ id, message = '', date }) => (
  <Tooltip title={message.slice(0, 150)}>
    <CardWrapper
      onClick={() => window.open(
        `https://www.facebook.com/${id.split('_')[0]}/posts/${
          id.split('_')[1]
        }`,
        '_target'
      )}
    >
      <Box
        sx={{
          // border: "1px solid #16b9b3",
          // borderRadius: '10px'
          fontWeight: 'bold',
        }}
      >
        {/* {title} */}
        時間：
        {format(new Date(date), 'yyyy/MM/dd')}
      </Box>
      <ContentWrapper>{message}</ContentWrapper>
      {/* <Typography sx={{ color: "#16b9b3" }}>{message}</Typography> */}
    </CardWrapper>
  </Tooltip>
);

export default Card;
