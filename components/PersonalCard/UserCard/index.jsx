import { BASE_URL } from '@/constants/common';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { MapPin, Edit } from 'lucide-react';
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
          variant="outline"
          className="absolute right-[30px] top-[30px] rounded-[20px] text-sm text-[#536166] shadow-none hover:text-[#16B9B3] max-md:hidden"
          onClick={() => {
            router.push('/personal-card');
          }}
        >
          <Edit color="#16B9B3" />
          編輯
        </Button>
      ) : (
        <DropdownMenu sx={BottonEdit} />
      )}

      <StyledProfileBaseInfo>
        <AvatorComponent photoURL={photoURL} />
        <div className="ml-3">
          <StyledProfileTitle>
            <div>
              <h2>{userName || '-'}</h2>
              {educationStepLabel && <span>{educationStepLabel}</span>}
            </div>
            <p>{role || '-'}</p>
          </StyledProfileTitle>

          <StyledProfileLocation>
            <MapPin style={{ marginRight: '10px' }} />
            {location
              ? location.length >= 2
                ? locations.join('').replace('台灣', '').replaceAll('null', '')
                : locations.join('')
              : '-'}
          </StyledProfileLocation>
        </div>
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
            />
          )}
          {!!contactList.facebook && (
            <SocialMediaItem
              tag="li"
              link={`https://www.facebook.com/${contactList.facebook}`}
              text={contactList.facebook}
            />
          )}
          {!!contactList.linkedin && (
            <SocialMediaItem
              tag="li"
              link={`https://www.linkedin.com/in/${contactList.linkedin}`}
              text={contactList.linkedin}
            />
          )}
          {!!contactList.github && (
            <SocialMediaItem
              tag="li"
              link={`https://github.com/${contactList.github}`}
              text={contactList.github}
            />
          )}
        </StyledProfileSocial>

        <StyledProfileDate>
          更新日期：
          {format(updatedDate, 'yyyy/MM/dd')}
        </StyledProfileDate>
      </StyledProfileOther>
    </StyledProfileWrapper>
  );
}

export default UserCard;
