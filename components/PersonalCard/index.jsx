import { useMemo } from 'react';
import { useRouter } from 'next/router';
import { Box, Button } from '@mui/material';
import Skeleton from '@mui/material/Skeleton';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';

import {
  WANT_TO_DO_WITH_PARTNER,
  ROLE,
  EDUCATION,
} from '@/constants/member';
import { mapToTable } from '@/utils/helper';
import SEOConfig from '@/components/SEOConfig';
import InfoCompletionGuard from '@/shared/components/InfoCompletionGuard';
import ContactButton from '@/shared/components/ContactButton';
import { cn } from '@/utils/cn';
import MyGroup from './MyGroup';
import UserCard from './UserCard';
import UserTabs from './UserTabs';
import UserInfoBasic from './UserTabs/UserInfoBasic';
import { StyledPanelBox } from './UserTabs/UserTabs.styled';

const BottonBack = {
  color: '#536166',
  fontSize: '14px',
  position: 'absolute',
  left: '-10px',
  top: '-50px',
  boxShadow: 'unset',
  '&:hover': {
    color: '#16B9B3',
  },
  '@media (max-width: 767px)': {
    position: 'unset',
  },
};
const BottonEdit = {
  display: 'none',
  '@media (max-width: 767px)': {
    display: 'flex',
    width: '100%',
    color: '#536166',
    fontSize: '14px',
    boxShadow: 'unset',
    borderRadius: '20px',
    marginTop: '32px',
    padding: '8px 0',
    '&:hover': {
      color: '#16B9B3',
    },
  },
};
const WANT_TO_DO_WITH_PARTNER_TABLE = mapToTable(WANT_TO_DO_WITH_PARTNER);
const ROLE_LIST = mapToTable(ROLE);
const EDUCATION_STAGE_TABLE = mapToTable(EDUCATION);

const Profile = ({
  _id,
  name,
  email,
  photoURL,
  tagList = [],
  roleList = [],
  educationStage,
  selfIntroduction,
  wantToDoList = [],
  location,
  share,
  isMe,
  contactList = {},
  updatedDate,
  isLoading,
}) => {
  const router = useRouter();
  const role = roleList.length > 0 && ROLE_LIST[roleList[0]];
  const edu = educationStage && EDUCATION_STAGE_TABLE[educationStage];
  const wantTodo = wantToDoList
    .map((item) => WANT_TO_DO_WITH_PARTNER_TABLE[item])
    .join('、');

  const SEOData = useMemo(
    () => ({
      title: `${name}的小島｜島島阿學`,
      description:
        '「島島阿學」盼能透過建立多元的學習資源網絡，讓自主學習者能找到合適的成長方法，進一步成為自己想成為的人，從中培養共好精神。目前正積極打造「可共編的學習資源平台」。',
      keywords: '島島阿學',
      author: '島島阿學',
      copyright: '島島阿學',
      imgLink: 'https://www.daoedu.tw/preview.webp',
      link: `${process.env.HOSTNAME}${router?.asPath}`,
    }),
    [router?.asPath, name]
  );

  return (
    <div
      className={cn(
        'relative min-h-screen-without-padding-top',
        'p-8 md:py-20 bg-primary-palest',
        'flex flex-col items-center'
      )}
    >
      <SEOConfig {...SEOData} />
      <Box
        sx={{
          width: '720px',
          position: 'relative',
          mb: '10px',
          '@media (max-width: 767px)': {
            width: '100%',
          },
        }}
      >
        <Button
          variant="text"
          sx={BottonBack}
          onClick={() => {
            router.push('/manage');
          }}
        >
          <ChevronLeftIcon />
          返回我的小島
        </Button>
        {isLoading ? (
          <Skeleton
            variant="rounded"
            width="720px"
            height={250}
            animation="wave"
          />
        ) : (
          <UserCard
            isLoginUser={isMe}
            isLoading={isLoading}
            educationStepLabel={edu}
            role={role}
            tagList={tagList.filter((t) => typeof t === 'string' && t !== '')}
            photoURL={photoURL}
            userName={name}
            location={location}
            updatedDate={updatedDate}
            contactList={contactList}
          />
        )}
      </Box>
      {/* UserTabs */}
      {isLoading ? (
        <Skeleton
          variant="rounded"
          width="720px"
          height={150}
          animation="wave"
        />
      ) : (
        <UserTabs
          isLoading={isLoading}
          panels={[
            {
              id: '1',
              title: '基本資訊',
              content: (
                <UserInfoBasic
                  description={selfIntroduction}
                  wantToDoList={wantTodo}
                  share={share}
                />
              ),
            },
            {
              id: '2',
              title: '便利貼',
              content: <StyledPanelBox>即將推出，敬請期待</StyledPanelBox>,
            },
            {
              id: '3',
              title: '學習計畫',
              content: <StyledPanelBox>即將推出，敬請期待</StyledPanelBox>,
            },
            {
              id: '4',
              title: '分享的資源',
              content: <StyledPanelBox>即將推出，敬請期待</StyledPanelBox>,
            },
            {
              id: '5',
              title: '發起的揪團',
              content: (
                <MyGroup
                  userId={_id}
                  sx={{
                    maxWidth: '100%',
                    padding: '40px 30px',
                    alignItems: 'flex-start',
                    '@media (max-width: 767px)': {
                      padding: '30px',
                    },
                  }}
                />
              ),
            },
          ]}
        />
      )}
      {!isMe ? (
        <InfoCompletionGuard>
          <ContactButton
            user={{
              email, name, photoURL, roleList,
            }}
            className="!mt-12"
            dialogTitle="聯繫夥伴"
            description="邀請訊息"
            descriptionPlaceholder="想要和新夥伴交流什麼呢？可以簡單的自我介紹，寫下想認識夥伴的原因。"
            emailTitle="有新夥伴想認識你！"
            emailSubject="【島島阿學】點開 Email，認識新夥伴"
          />
        </InfoCompletionGuard>
      ) : (
        <Button
          variant="outlined"
          sx={BottonEdit}
          onClick={() => {
            router.push('/personal-card');
          }}
        >
          <EditOutlinedIcon sx={{ color: '#16B9B3' }} />
          編輯
        </Button>
      )}
    </div>
  );
};

export default Profile;
