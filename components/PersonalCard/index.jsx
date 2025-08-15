import { useMemo } from 'react';
import { useRouter } from 'next/router';
import { Button } from '@mui/material';
import { ChevronLeft, Edit } from 'lucide-react';

import { ROLE, EDUCATION } from '@/constants/member';
import { mapToTable } from '@/utils/helper';
import SEOConfig from '@/components/SEOConfig';
import InfoCompletionGuard from '@/shared/components/InfoCompletionGuard';
import { ContactModal } from '@/features/email';
import MyGroup from './MyGroup';
import UserCard from './UserCard';
import UserTabs from './UserTabs';
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
}) => {
  const router = useRouter();
  const role = roleList.length > 0 && ROLE_LIST[roleList[0]];
  const edu = educationStage && EDUCATION_STAGE_TABLE[educationStage];
  const user = {
    id: _id,
    email,
    name,
    photoURL,
    roleList,
  };

  const SEOData = useMemo(
    () => ({
      title: `${name || ''} 的個人卡｜島島阿學`,
      description:
        '「島島阿學」盼能透過建立多元的學習資源網絡，讓自主學習者能找到合適的成長方法，進一步成為自己想成為的人，從中培養共好精神。目前正積極打造「可共編的學習資源平台」。',
      keywords: '島島阿學',
      author: '島島阿學',
      copyright: '島島阿學',
      imgLink: 'https://www.daoedu.tw/preview.webp',
      link: `${process.env.HOSTNAME}/personal-card`,
    }),
    [name]
  );

  return (
    <InfoCompletionGuard _id={_id} isMe={isMe} contactList={contactList}>
      <SEOConfig {...SEOData} />
      <StyledPanelBox className="container">
        <Button
          variant="text"
          sx={BottonBack}
          className="group"
          onClick={() => {
            router.push('/personal-card');
          }}
        >
          <ChevronLeft />
          返回
        </Button>

        <UserCard
          isLoginUser={isMe}
          tagList={tagList}
          role={role}
          educationStepLabel={edu}
          photoURL={photoURL}
          userName={name}
          location={location}
          contactList={contactList}
          updatedDate={updatedDate}
        />

        <Button
          variant="text"
          sx={BottonEdit}
          onClick={() => {
            router.push('/personal-card');
          }}
        >
          <Edit color="#16B9B3" />
          編輯
        </Button>

        <UserTabs
          name={name}
          email={email}
          tagList={tagList}
          selfIntroduction={selfIntroduction}
          wantToDoList={wantToDoList}
          share={share}
        />

        <MyGroup />
      </StyledPanelBox>
      {!isMe && (
        <div className="mt-8 flex justify-center">
          <ContactModal
            targetUser={user}
            emailTitle="你發起的揪團有人來信！"
            emailSubject="【島島阿學】點開 Email，揪團有新消息"
            modalTitle="聯繫主揪"
            description="想跟主揪說的話"
            descriptionPlaceholder="想參加主揪的團體嗎？可以簡單的自我介紹，寫下想加入的原因。"
          />
        </div>
      )}
    </InfoCompletionGuard>
  );
};

export default Profile;
