import { BASE_URL } from '@/constants/common';
import { useRouter } from 'next/router';
import moment from 'moment';
import { Box, Button } from '@mui/material';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import { RiInstagramFill } from 'react-icons/ri';
import { FaFacebook, FaLine, FaDiscord } from 'react-icons/fa';
import DropdownMenu from './Dropdown';
import SocialMediaItem from './SocialMediaItem';
import AvatorComponent from './Avator';
import Tag from './Tag';
import {
  StyledProfileWrapper,
  StyledProfileBaseInfo,
  StyledProfileDate,
  StyledProfileLocation,
  StyledProfileOther,
  StyledProfileSocial,
  StyledProfileTag,
  StyledProfileTitle,
} from './UserCard.styled';

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
        <AvatorComponent photoURL={photoURL} />
        <Box sx={{ marginLeft: '12px' }}>
          <StyledProfileTitle>
            <div>
              <h2>{userName || '-'}</h2>
              {educationStepLabel && <span>{educationStepLabel}</span>}
            </div>
            <p>{role || '-'}</p>
          </StyledProfileTitle>

          <StyledProfileLocation>
            <LocationOnOutlinedIcon sx={{ marginRight: '10px' }} />
            {location
              ? location.length >= 2
                ? locations.join('').replace('台灣', '').replaceAll('null', '')
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
          {!!contactList['聯繫方式'] && (
            <li>
              <a
                href={`${BASE_URL}/auth/google`}
                target="_blank"
                rel="noreferrer"
              >
                {contactList['聯繫方式']}
              </a>
            </li>
          )}
          {!!contactList.instagram && (
            <SocialMediaItem
              tag="li"
              link={`https://www.instagram.com/${contactList.instagram}`}
              text={contactList.instagram}
              iconComponent={<RiInstagramFill size="20px" />}
            />
          )}
          {!!contactList.facebook && (
            <SocialMediaItem
              tag="li"
              link={`https://www.facebook.com/${contactList.facebook}`}
              text={contactList.facebook}
              iconComponent={<FaFacebook size="20px" />}
            />
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
