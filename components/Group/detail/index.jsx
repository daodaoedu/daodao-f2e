import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import Button from '@/shared/components/Button';
import Image from '@/shared/components/Image';
import chatSvg from '@/public/assets/icons/chat.svg';
import { StyledStatus } from '../GroupList/GroupCard.styled';
import StyledPaper from '../Paper.styled';
import TeamInfoCard from './TeamInfoCard';
import OrganizerCard from './OrganizerCard';
import More from './More';
import { StyledContainer, StyledHeading, StyledLink } from './Detail.styled';

function GroupDetail({ source, isLoading }) {
  return (
    <Box sx={{ background: '#f3fcfc' }}>
      <StyledContainer>
        <StyledLink href="/group" style={{ marginBottom: '10px' }}>
          <ArrowBackIosNewIcon fontSize="inherit" />
          <span>返回</span>
        </StyledLink>
        {isLoading ? (
          <Skeleton variant="rectangular" height={300} animation="wave" />
        ) : (
          <Image height="300px" src={source?.photoURL} alt={source?.photoAlt} />
        )}
        <Box sx={{ position: 'relative', p: '10px' }}>
          {source?.isGrouping ? (
            <StyledStatus>揪團中</StyledStatus>
          ) : (
            <StyledStatus className="finished">已結束</StyledStatus>
          )}
          <More />
          <StyledHeading>{source?.title}</StyledHeading>
        </Box>
        <StyledPaper sx={{ mb: '10px' }}>
          <TeamInfoCard data={source} />
        </StyledPaper>
        <StyledPaper>
          <OrganizerCard data={source} />
        </StyledPaper>
        <Box
          sx={{
            mt: '32px',
            mb: '48px',
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          <Button sx={{ marginTop: 0 }}>
            <img
              src={chatSvg.src}
              alt="contact icon"
              style={{ marginRight: '8px' }}
            />
            聯繫主揪
          </Button>
        </Box>
      </StyledContainer>
    </Box>
  );
}

export default GroupDetail;
