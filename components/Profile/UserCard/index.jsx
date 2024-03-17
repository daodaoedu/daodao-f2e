import styled from '@emotion/styled';
import { Box, Chip, Button, Skeleton, Typography } from '@mui/material';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import moment from 'moment';
import { useRouter } from 'next/router';
import { RiInstagramFill } from 'react-icons/ri';
import { FaFacebook, FaLine, FaDiscord } from 'react-icons/fa';
import DropdownMenu from './Dropdown';

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
    display: 'none',
  },
};

const StyledProfileWrapper = styled(Box)`
  width: 100%;
  padding: 30px;
  background-color: #fff;
  border-radius: 20px;
  @media (max-width: 767px) {
    width: 100%;
    padding: 16px;
  }
`;
const StyledProfileBaseInfo = styled(Box)`
  display: flex;
  justify-content: flex-start;
  align-items: center;
`;
const StyledProfileTitle = styled(Box)`
  div {
    display: flex;
    align-items: center;
  }
  h2 {
    color: #536166;
    font-size: 18px;
    font-style: normal;
    font-weight: 700;
    line-height: 120%;
    margin-right: 10px;
  }
  span {
    border-radius: 4px;
    background: #f3f3f3;
    padding: 3px 10px;
  }
  p {
    color: #92989a;
    font-size: 14px;
    font-style: normal;
    font-weight: 400;
    line-height: 140%; /* 19.6px */
  }
`;
const StyledProfileLocation = styled(Typography)`
  margin-top: 12px;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  color: #536166;
  font-size: 12px;
  font-style: normal;
  font-weight: 500;
  line-height: 140%; /* 16.8px */
`;
const StyledProfileTag = styled(Box)`
  margin-top: 24px;
  display: flex;
  flex-wrap: wrap;
`;
const StyledProfileOther = styled(Box)`
  margin-top: 24px;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  @media (max-width: 767px) {
    flex-direction: column;
    align-items: flex-start;
  }
`;
const StyledProfileSocial = styled.ul`
  display: flex;
  align-items: center;
  flex-direction: column;
  align-items: flex-start;
  li {
    align-items: center;
    display: flex;
    margin-right: 16px;
    margin-bottom: 8px;
  }
  li:last-of-type {
    margin-bottom: 0;
  }
  li svg {
    color: #16b9b3;
  }
  li p,
  li a {
    margin-left: 5px;
    color: #293a3d;
    font-size: 12px;
    font-style: normal;
    font-weight: 400;
    line-height: 140%;
  }

  li a {
    color: #16b9b3;
    cursor: pointer;
    text-decoration: underline;
  }
`;
const StyledProfileDate = styled.p`
  font-size: 12px;
  color: #92989a;
  font-weight: 400;
  line-height: 140%;
  @media (max-width: 767px) {
    width: 100%;
    text-align: right;
  }
`;

function Tag({ label }) {
  return (
    <Chip
      label={label}
      value={label}
      sx={{
        margin: '5px',
        whiteSpace: 'nowrap',
        fontWeight: 400,
        fontSize: '14px',
        bgcolor: '#DEF5F5',
      }}
    />
  );
}

function Avator({ photoURL }) {
  return (
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
  );
}

function UserCard({
  isLoginUser,
  tagList = [],
  role,
  educationStepLabel,
  photoURL,
  userName,
  location,
  contactList = {},
  updatedDate,
}) {
  const router = useRouter();
  const locations = location && location.split('@');

  return (
    <StyledProfileWrapper>
      {isLoginUser ? (
        <Button
          variant="outlined"
          sx={BottonEdit}
          onClick={() => {
            router.push('/profile');
          }}
        >
          <EditOutlinedIcon sx={{ color: '#16B9B3' }} />
          編輯
        </Button>
      ) : (
        <DropdownMenu sx={BottonEdit} />
      )}

      <StyledProfileBaseInfo>
        <Avator photoURL={photoURL} />
        <Box sx={{ marginLeft: '12px' }}>
          <StyledProfileTitle>
            <div>
              <h2>{userName || '-'}</h2>
              {educationStepLabel && <span>{educationStepLabel}</span>}
            </div>
            <p>{role || '-'}</p>
          </StyledProfileTitle>

          <StyledProfileLocation>
            <LocationOnOutlinedIcon sx={{ marginRight: '10px' }} />{' '}
            {location
              ? location.length >= 2
                ? locations.join('').replace('台灣', '').replace('null', '')
                : locations.join('')
              : '-'}
          </StyledProfileLocation>
        </Box>
      </StyledProfileBaseInfo>

      {Array.isArray(tagList) && (
        <StyledProfileTag>
          {tagList.map((tag) => (
            <Tag key={tag} label={tag} />
          ))}
        </StyledProfileTag>
      )}

      <StyledProfileOther>
        <StyledProfileSocial style={{ listStyle: 'none' }}>
          {!!contactList.instagram && (
            <li>
              <RiInstagramFill size="20px" />
              <a
                target="_blank"
                rel="noreferrer"
                href={`https://www.instagram.com/${contactList.instagram}`}
              >
                {contactList.instagram}
              </a>
            </li>
          )}
          {!!contactList.facebook && (
            <li>
              <FaFacebook size="20px" />
              <a
                target="_blank"
                rel="noreferrer"
                href={`https://www.facebook.com/${contactList.facebook}`}
              >
                {contactList.facebook}
              </a>
            </li>
          )}
          {!!contactList.line && (
            <li>
              <FaLine size="20px" />
              <p>{contactList.line}</p>
            </li>
          )}
          {!!contactList.discord && (
            <li>
              <FaDiscord size="20px" />
              <p>{contactList.discord}</p>
            </li>
          )}
        </StyledProfileSocial>
        <StyledProfileDate>
          {updatedDate
            ? moment(updatedDate).fromNow()
            : moment(new Date() - 500 * 60 * 60).fromNow()}
        </StyledProfileDate>
      </StyledProfileOther>
    </StyledProfileWrapper>
  );
}

export default UserCard;
