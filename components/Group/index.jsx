import styled from '@emotion/styled';
import { Box } from '@mui/material';
import AreaChips from './AreaChips';
import Banner from './Banner';
import SearchField from './SearchField';
import SelectedCategory from './SelectedCategory';
import StyledPaper from './Paper.styled';
import GroupList from './GroupList';
import More from './More';

const StyledContainer = styled.div`
  position: relative;
  margin: 70px auto 0;
  width: 924px;

  @media (max-width: 1024px) {
    width: 768px;
  }

  @media (max-width: 800px) {
    padding: 0 16px;
    width: 100%;
  }
`;

function Group() {
  return (
    <Box sx={{ background: '#f3fcfc' }}>
      <Banner />
      <StyledContainer>
        <StyledPaper>
          <SearchField />
          <SelectedCategory />
        </StyledPaper>
        <StyledPaper as="main" sx={{ marginTop: '24px' }}>
          <AreaChips />
          <GroupList />
        </StyledPaper>
      </StyledContainer>
      <More />
    </Box>
  );
}

export default Group;
