import { styled } from '@mui/material/styles';
import { Box, Typography, Skeleton } from '@mui/material';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import { LazyLoadImage } from 'react-lazy-load-image-component';

const GroupItemWrapper = styled('li')`
  position: relative;
  flex-basis: calc(33.33% - 8px);
  margin-top: 16px;
  margin-bottom: 16px;
  transition: box-shadow 0.2s;
  border-radius: 8px;

  .image-wrapper {
    transition: transform 0.2s;
  }

  &:hover {
    box-shadow: 0 4px 6px rgba(196, 194, 193, 0.4);

    .image-wrapper {
      transform: scale(0.95);
    }
  }

  &::after {
    content: '';
    position: absolute;
    left: -12px;
    bottom: -16px;
    display: block;
    width: calc(100% + 36px);
    height: 1px;
    background: #dbdbdb;
  }

  &:nth-of-type(1) {
    margin-top: 0;
  }

  &:nth-last-of-type(1) {
    margin-bottom: 0;
    &::after {
      content: none;
    }
  }

  @media (max-width: 767px) {
    flex-basis: calc(50% - 12px);
  }

  @media (min-width: 767px) {
    &:nth-of-type(3) {
      margin-top: 0;
    }

    &:nth-last-of-type(3) {
      margin-bottom: 0;
      &::after {
        content: none;
      }
    }
  }

  @media (max-width: 560px) {
    flex-basis: calc(100% - 24px);
  }

  @media (min-width: 560px) {
    &:nth-of-type(2) {
      margin-top: 0;
    }

    &:nth-last-of-type(2) {
      margin-bottom: 0;
      &::after {
        content: none;
      }
    }
  }
`;

const Label = ({ children }) => (
  <Typography sx={{ flexBasis: '50px', color: '#293A3D', fontSize: '12px' }}>
    {children}
  </Typography>
);

const Text = ({
  lineClamp = '1',
  fontSize = '12px',
  color = '#536166',
  children,
}) => (
  <Typography
    sx={{
      display: '-webkit-box',
      WebkitBoxOrient: 'vertical',
      WebkitLineClamp: lineClamp,
      overflow: 'hidden',
      color,
      fontSize,
    }}
  >
    {children}
  </Typography>
);

function GroupItem({
  photoURL,
  photoAlt,
  time,
  category = [],
  partnerEducationStep,
  description,
  avatarURL,
  user,
  role,
  area,
}) {
  return (
    <GroupItemWrapper>
      <Box className="image-wrapper">
        <LazyLoadImage
          alt={photoAlt}
          src={photoURL}
          width="100%"
          height="122px"
          effect="opacity"
          style={{
            borderRadius: '8px',
            background: 'rgba(240, 240, 240, .8)',
            objectFit: 'cover',
            objectPosition: 'center',
          }}
          placeholder={<Loading />}
        />
      </Box>
      <Box sx={{ p: '10px', pt: 0 }}>
        <Box sx={{ display: 'flex', gap: '4px' }}>
          <Label>時間</Label>
          <Text>|</Text>
          <Text>{time}</Text>
        </Box>
        <Box sx={{ display: 'flex', gap: '4px' }}>
          <Label>學習領域</Label>
          <Text>|</Text>
          <Text>{category.join('、')}</Text>
        </Box>
        <Box sx={{ display: 'flex', gap: '4px' }}>
          <Label>夥伴階段</Label>
          <Text>|</Text>
          <Text>{partnerEducationStep}</Text>
        </Box>
        <Box sx={{ my: '10px' }}>
          <Text lineClamp="2" fontSize="14px">
            {description}
          </Text>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <LazyLoadImage
              alt={user}
              src={avatarURL}
              width="20px"
              height="20px"
              effect="opacity"
              style={{
                borderRadius: '100%',
                background: 'rgba(240, 240, 240, .8)',
                objectFit: 'cover',
                objectPosition: 'center',
              }}
              placeholder={<Loading />}
            />
            <Box sx={{ display: 'flex', gap: '4px' }}>
              <Text color="#293A3D" fontSize="14px">
                {user}
              </Text>
              <Text color="#92989A" fontSize="14px">
                {role}
              </Text>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <LocationOnOutlinedIcon fontSize="16px" sx={{ color: '#536166' }} />
            <Text color="#92989A">{area}</Text>
          </Box>
        </Box>
      </Box>
    </GroupItemWrapper>
  );
}

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

export default GroupItem;
