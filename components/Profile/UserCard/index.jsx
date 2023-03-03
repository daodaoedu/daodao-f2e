import { Box, Button, Chip, Skeleton, Typography } from '@mui/material';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import { useRouter } from 'next/router';
import LOCATION from '../../../constants/countries.json';

const BottonEdit = {
  color: '#536166',
  fontSize: '14px',
  position: 'absolute',
  right: '30px',
  top: '30px',
  boxShadow: 'unset',
  borderRadius: '20px',
  '&:hover': {
    color: '#16B9B3',
  },
  '@media (max-width: 767px)': {
    position: 'absolute',
    right: '25%',
    top: '252%',
    width: '160px',
  },
};

function Tag({ label }) {
  return (
    <Chip
      label={label}
      value={label}
      sx={{
        backgroundColor: '#fff',
        opacity: '80%',
        cursor: 'pointer',
        margin: '5px',
        whiteSpace: 'nowrap',
        fontWeight: 500,
        fontSize: '16px',
        bgcolor: 'rgb(219, 237, 219)',
        '&:hover': {
          opacity: '100%',
          backgroundColor: '#fff',
          transition: 'transform 0.4s',
        },
      }}
    />
  );
}
function UserCard({ isLoading, tagList, photoURL, userName, location }) {
  const router = useRouter();
  if (isLoading) {
    return (
      <Box
        sx={{
          width: '720px',
          padding: '40px 30px ',
          bgcolor: '#fff',
          borderRadius: '20px',
          '@media (max-width: 767px)': {
            width: '316px',
          },
        }}
      >
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'flex-start',
            alignItems: 'center',
          }}
        >
          <Skeleton
            sx={{
              height: '80px',
              width: '80px',
              background: 'rgba(240, 240, 240, .8)',
              marginTop: '4px',
            }}
            variant="circular"
            animation="wave"
          />
          <Button variant="outlined" sx={BottonEdit}>
            <EditOutlinedIcon />
            編輯
          </Button>
          <Box sx={{ marginLeft: '12px' }}>
            <Skeleton variant="text" width={200} />
            <Skeleton variant="text" width={200} />
            <Typography
              sx={{
                display: 'flex',
                justifyContent: 'flex-start',
                alignItems: 'center',
                marginTop: '12px',
              }}
            >
              <LocationOnOutlinedIcon sx={{ marginRight: '10px' }} />{' '}
              <Skeleton variant="text" width={200} />
            </Typography>
          </Box>
        </Box>
        <Box sx={{ marginTop: '24px' }}>
          <Skeleton variant="text" width={200} />
        </Box>
      </Box>
    );
  }
  return (
    <Box
      sx={{
        width: '720px',
        padding: '40px 30px ',
        bgcolor: '#fff',
        borderRadius: '20px',
        '@media (max-width: 767px)': {
          width: '316px',
        },
      }}
    >
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'flex-start',
          alignItems: 'center',
        }}
      >
        <LazyLoadImage
          alt="login"
          src={photoURL || ''}
          height={80}
          width={80}
          effect="opacity"
          style={{
            borderRadius: '100%',
            background: 'rgba(240, 240, 240, .8)',
            objectFit: 'cover',
            objectPosition: 'center',
            minHeight: '80px',
            minWidth: '80px',
          }}
          placeholder={
            // eslint-disable-next-line react/jsx-wrap-multilines
            <Skeleton
              sx={{
                height: '80px',
                width: '80px',
                background: 'rgba(240, 240, 240, .8)',
                marginTop: '4px',
              }}
              variant="circular"
              animation="wave"
            />
          }
        />
        <Button
          variant="outlined"
          sx={BottonEdit}
          onClick={() => {
            router.push('/profile/edit');
          }}
        >
          <EditOutlinedIcon />
          編輯
        </Button>
        <Box sx={{ marginLeft: '12px' }}>
          <Typography sx={{ color: '#536166', fontSize: '18px' }}>
            {userName || '-'}
          </Typography>
          <Typography component="p" sx={{ color: '#92989A' }}>
            -
          </Typography>
          <Typography
            sx={{
              display: 'flex',
              justifyContent: 'flex-start',
              alignItems: 'center',
              marginTop: '12px',
            }}
          >
            <LocationOnOutlinedIcon sx={{ marginRight: '10px' }} />{' '}
            {LOCATION.find(
              (item) => item.alpha2 === location || item.alpha3 === location,
            )?.name || '-'}
          </Typography>
        </Box>
      </Box>
      <Box sx={{ marginTop: '24px' }}>
        {tagList.map((tag) => (
          <Tag key={tag} label={tag} />
        ))}
      </Box>
    </Box>
  );
}

export default UserCard;
