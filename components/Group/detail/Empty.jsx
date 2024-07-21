import Link from 'next/link';
import Box from '@mui/material/Box';
import nobodyLandGif from '@/public/assets/nobody-land.gif';
import Button from '@/shared/components/Button';
import StyledPaper from '../Paper.styled';
import { StyledContainer } from './Detail.styled';

function EmptyGroup() {
  return (
    <Box sx={{ background: '#f3fcfc', pb: '48px' }}>
      <StyledContainer>
        <StyledPaper sx={{ textAlign: 'center', fontSize: '20px' }}>
          <Box sx={{ position: 'relative', zIndex: 1 }}>
            糟糕！找不到這個揪團，要不要尋找別的揪團？
          </Box>
          <Box
            sx={{
              my: -2,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <img
              src={nobodyLandGif.src}
              alt="nobody-land"
              width="300"
              height="300"
            />
          </Box>
        </StyledPaper>
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <Button component={Link} href="/group">
            前往揪團頁
          </Button>
        </Box>
      </StyledContainer>
    </Box>
  );
}

export default EmptyGroup;
