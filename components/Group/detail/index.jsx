import Box from '@mui/material/Box';
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

const teamInfoData = {
  category: ['類別2', '類別4'],
  area: '活動地區',
  time: '1214-01-01T00:00:00.000Z',
  partnerStyle: '合作夥伴風格',
  partnerEducationStep: '合作夥伴教育階段',
};

function GroupDetail() {
  // const res = fetch(
  //   '/activity/659aca5d2dee7c7764aebf61',
  // ).then((res) => res.json());
  // res.then((data) => data.data[0]).then(console.log);
  return (
    <Box sx={{ background: '#f3fcfc' }}>
      <StyledContainer>
        <StyledLink href="/group" style={{ marginBottom: '10px' }}>
          <ArrowBackIosNewIcon fontSize="inherit" />
          <span>返回</span>
        </StyledLink>
        <Image height="300px" src="/123" />
        <Box sx={{ position: 'relative', mt: '10px' }}>
          <StyledStatus>揪團中</StyledStatus>
          <More />
          <StyledHeading>
            尋找北北基線上自學程式、AI的小夥伴們，標題可能會有一行或是兩行或是到三行，最多總共五十個字
          </StyledHeading>
        </Box>
        <StyledPaper sx={{ mt: '10px' }}>
          <TeamInfoCard data={teamInfoData} />
        </StyledPaper>
        <StyledPaper sx={{ mt: '10px' }}>
          <OrganizerCard />
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
