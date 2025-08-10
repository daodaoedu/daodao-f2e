import styled from '@emotion/styled';
import { Tooltip } from '@mui/material';
import { LazyLoadImage } from 'react-lazy-load-image-component';

const CardWrapper = styled.li`
  position: relative;
  width: 150px;
  height: 150px;
  flex: 0 0 150px;
  margin: 5px;
  color: #16b9b3;
  overflow: hidden;

  cursor: pointer;
  object-fit: cover;
  &:hover {
    transform: scale(1.05);
    transition: transform 0.4s;
  }
`;

const ImageWrapper = styled(LazyLoadImage)`
  width: 150px;
  height: 150px;
  min-width: 150px;
  min-height: 150px;
  position: relative;
  object-fit: cover;
  object-position: center;
`;

const Card = ({ message = '', image, url }) => (
  <Tooltip title={message.slice(0, 150)}>
    <CardWrapper onClick={() => window.open(url, '_target')}>
      <ImageWrapper alt={message} src={image} effect="opacity" />
    </CardWrapper>
  </Tooltip>
);

export default Card;
