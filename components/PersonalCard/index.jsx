import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/shared/ui/button';
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

// Styles moved to className props
const ROLE_LIST = mapToTable(ROLE);
const EDUCATION_STAGE_TABLE = mapToTable(EDUCATION);

const Profile = ({
  id,
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
    id,
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
      imgLink: 'https://www.daoedu.tw/assets/brand/horizontal-primary-logo.svg',
      link: `${process.env.HOSTNAME}/personal-card`,
    }),
    [name]
  );

  return (
    <InfoCompletionGuard id={id} isMe={isMe} contactList={contactList}>
      <SEOConfig {...SEOData} />
      <StyledPanelBox className="container">
        <Button
          variant="ghost"
          className="group absolute left-[-10px] top-[-50px] text-sm text-[#536166] shadow-none hover:text-[#16B9B3] max-md:relative max-md:left-0 max-md:top-0"
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
          variant="ghost"
          className="mt-8 hidden w-full rounded-[20px] py-2 text-sm text-[#536166] shadow-none hover:text-[#16B9B3] max-md:flex"
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
