import { useMemo } from 'react';
import { useRouter } from 'next/router';
import { Box, Button, Typography } from '@mui/material';
import Skeleton from '@mui/material/Skeleton';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';

import {
  WANT_TO_DO_WITH_PARTNER,
  ROLE,
  EDUCATION_STAGE,
} from '@/constants/member';
import { mapToTable } from '@/utils/helper';
import SEOConfig from '@/shared/components/SEO';
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
const ROLELIST = mapToTable(ROLE);
const EDUCATION_STAGE_TABLE = mapToTable(EDUCATION_STAGE);

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
  enableContactBtn = false,
  sendEmail,
  handleContactPartner,
  contactList = {},
  updatedDate,
  isLoading,
}) => {
  const router = useRouter();
  const role = roleList.length > 0 && ROLELIST[roleList[0]];
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
    [router?.asPath, name],
  );

  return (
    <Box
      sx={{
        background: 'linear-gradient(0deg, #f3fcfc, #f3fcfc), #f7f8fa',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
        padding: '80px 30px',
        '@media (max-width: 767px)': {
          padding: '30px',
        },
      }}
    >
      <SEOConfig data={SEOData} />
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
            router.push('/partner');
          }}
        >
          <ChevronLeftIcon />
          返回
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
            isLoginUser={email === sendEmail}
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
              title: '推薦的資源',
              content: <StyledPanelBox>即將推出，敬請期待</StyledPanelBox>,
            },
            {
              id: '3',
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
      {email !== sendEmail ? (
        <>
          <Button
            sx={{
              width: '160px',
              borderRadius: '20px',
              ml: '4px',
              mt: '56px',
              color: '#ffff',
              bgcolor: '#16B9B3',
            }}
            disabled={!enableContactBtn}
            variant="contained"
            onClick={handleContactPartner}
          >
            聯繫夥伴
          </Button>
          {!enableContactBtn && (
            <Typography
              onClick={() => router.push('/login')}
              sx={{ cursor: 'pointer', mt: '5px', fontSize: '12px' }}
            >
              <Typography
                as="span"
                sx={{
                  color: '#16B9B3',
                  fontSize: '12px',
                  textDecoration: 'underline',
                }}
              >
                註冊
              </Typography>
              或
              <Typography
                as="span"
                sx={{
                  color: '#16B9B3',
                  fontSize: '12px',
                  textDecoration: 'underline',
                }}
              >
                登入
              </Typography>
              即可聯繫夥伴！
            </Typography>
          )}
        </>
      ) : (
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
      )}
    </Box>
  );
};

export default Profile;
