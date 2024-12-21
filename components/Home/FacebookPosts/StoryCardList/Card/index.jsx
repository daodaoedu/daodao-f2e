import styled from '@emotion/styled';
import { Tooltip } from '@mui/material';
import { LazyLoadImage } from 'react-lazy-load-image-component';

const CardWrapper = styled.li`
  position: relative;
  width: 150px;
  height: calc(calc(150px / 9) * 16);
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
  height: calc(calc(150px / 9) * 16);
  min-width: 150px;
  min-height: calc(calc(150px / 9) * 16);
  position: relative;
  object-fit: cover;
  object-position: center;
`;

const VideoWrapper = styled.video`
  object-fit: cover;
  width: 100%;
  height: inherit;
`;

const Card = ({ message = '', media, url, type }) => {
  if (type === 'VIDEO') {
    return (
      <Tooltip title={message.slice(0, 150)}>
        <CardWrapper onClick={() => window.open(url, '_target')}>
          <VideoWrapper autoPlay muted loop playsInline preload="auto">
            <source src={media} type="video/mp4" />
          </VideoWrapper>
        </CardWrapper>
      </Tooltip>
    );
  }
  return (
    <Tooltip title={message.slice(0, 150)}>
      <CardWrapper onClick={() => window.open(url, '_target')}>
        <ImageWrapper alt={message} src={media} effect="opacity" />
      </CardWrapper>
    </Tooltip>
  );
};

export default Card;
