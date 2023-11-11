import Skeleton from '@mui/material/Skeleton';
import { LazyLoadImage } from 'react-lazy-load-image-component';

const Loading = () => (
  <Skeleton
    sx={{
      height: '50px',
      width: '50px',
      background: 'rgba(240, 240, 240, .8)',
      marginTop: '4px',
    }}
    animation="wave"
  />
);

const Image = ({
  src,
  alt,
  width = '100%',
  height = '122px',
  background = 'rgba(240, 240, 240, .8)',
  borderRadius = '8px',
}) => (
  <LazyLoadImage
    src={src}
    alt={alt}
    width={width}
    height={height}
    effect="opacity"
    style={{
      objectFit: 'cover',
      objectPosition: 'center',
      borderRadius,
      background,
    }}
    placeholder={<Loading />}
  />
);

export default Image;
