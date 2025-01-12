import { useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import { useAuth } from '@/contexts/Auth';
import Image from '@/shared/components/Image';
import ContactButton from '@/shared/components/ContactButton';
import { StyledStatus } from '../GroupList/GroupCard.styled';
import StyledPaper from '../Paper.styled';
import TeamInfoCard from './TeamInfoCard';
import OrganizerCard from './OrganizerCard';
import NoticeCard from './NoticeCard';
import More from './More';
import {
  StyledContainer,
  StyledHeading,
  StyledGoBack,
  StyledDesktopEditButton,
  StyledMobileEditButton,
} from './Detail.styled';
import ShareButtonGroup from './ShareButtonGroup';
import classNames from 'classnames';

console.log(classNames);


function GroupDetail({ id, source, isLoading }) {
  const router = useRouter();
  const { user } = useAuth();
  const isMyGroup = source?.userId === user?._id && !!user?._id;

  return (
    <Box sx={{ background: '#f3fcfc', pb: '48px' }}>
      <StyledContainer>
        <StyledGoBack onClick={router.back}>
          <ArrowBackIosNewIcon fontSize="inherit" />
          <span>返回</span>
        </StyledGoBack>
        {isLoading ? (
          <Skeleton variant="rounded" height={300} animation="wave" />
        ) : (
          <Image height="300px" src={source?.photoURL} alt={source?.photoAlt} />
        )}
        <Box sx={{ position: 'relative', p: '10px' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {isLoading ? (
              <Skeleton
                variant="rounded"
                height={26}
                width={68}
                animation="wave"
              />
            ) : source?.isGrouping ? (
              <StyledStatus>揪團中</StyledStatus>
            ) : (
              <StyledStatus className="finished">已結束</StyledStatus>
            )}
          </Box>
          {isMyGroup ? (
            <StyledDesktopEditButton
              variant="outlined"
              onClick={() => router.push(`/group/edit?id=${id}`)}
            >
              編輯
            </StyledDesktopEditButton>
          ) : (
            <More />
          )}
          <Box sx={{ mt: '8px' }}>
            <ShareButtonGroup
              title={source?.title}
              text={source?.description}
              url={window.location.href}
              hashtag={source?.hashtag}
            />
          </Box>
          <StyledHeading>
            {isLoading ? <Skeleton animation="wave" /> : source?.title}
          </StyledHeading>
        </Box>
        <StyledPaper sx={{ mb: '10px' }}>
          <TeamInfoCard data={source} isLoading={isLoading} />
        </StyledPaper>
        <StyledPaper sx={{ mb: '10px' }}>
          <OrganizerCard data={source} isLoading={isLoading} />
        </StyledPaper>
        <StyledPaper>
          <NoticeCard data={source} isLoading={isLoading} />
        </StyledPaper>
        <Box
          sx={{
            mt: '32px',
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          {isMyGroup ? (
            <StyledMobileEditButton
              variant="outlined"
              onClick={() => router.push(`/group/edit?id=${id}`)}
            >
              編輯
            </StyledMobileEditButton>
          ) : (
            <ContactButton
              user={source?.user || {}}
              activityTitle={source?.title}
              dialogTitle="聯繫主揪"
              description="想跟主揪說的話"
              descriptionPlaceholder="想參加主揪的團體嗎？可以簡單的自我介紹，寫下想加入的原因。"
              emailTitle="你發起的揪團有人來信！"
              emailSubject="【島島阿學】點開 Email，揪團有新消息"
            />
          )}
        </Box>
      </StyledContainer>
    </Box>
  );
}

export default GroupDetail;
