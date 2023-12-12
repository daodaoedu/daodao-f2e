import styled from '@emotion/styled';
import { Box } from '@mui/material';
import AreaChips from './AreaChips';
import Banner from './Banner';
import SearchField from './SearchField';
import SelectedCategory from './SelectedCategory';
import GroupList from './GroupList';
import More from './More';

const StyledGroup = styled.div`
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

const ContainerWrapper = styled(Box)`
  padding: 32px;
  border-radius: 20px;
  box-shadow: 0px 4px 6px rgba(196, 194, 193, 0.2);
  background: #fff;
  z-index: 2;
`;

function Group() {
  return (
    <Box sx={{ background: '#f3fcfc' }}>
      <Banner />
      <StyledGroup>
        <ContainerWrapper>
          <SearchField />
          <SelectedCategory />
        </ContainerWrapper>
        <ContainerWrapper as="main" sx={{ marginTop: '24px' }}>
          <AreaChips />
          <GroupList />
        </ContainerWrapper>
      </StyledGroup>
      <More />
    </Box>
  );
}

export default Group;
