import styled from '@emotion/styled';
import { Box } from '@mui/material';
import { useRouter } from 'next/router';
import SearchInput from './SearchInput';
import HotTags from './HotTags';
import FeeDropdown from './FeeDropdown';
import AgeCheckbox from './AgeCheckbox';

const SearchFieldWrapper = styled.div`
  width: 100%;
`;

const SearchField = () => {
  const { query } = useRouter();
  const queryList = (query?.cats ?? '').split(',').reverse();
  return (
    <SearchFieldWrapper>
      <SearchInput />
      <HotTags queryList={queryList} />
      <Box
        sx={{
          margin: '5px 0',
          display: 'flex',
          justifyContent: 'flex-start',
          alignItems: 'center',
          '@media (max-width: 767px)': {
            margin: '10px 0',
            flexDirection: 'column',
            alignItems: 'flex-start',
          },
        }}
      >
        {/* <AgeDropdown /> */}
        <AgeCheckbox />
        <FeeDropdown />
      </Box>
    </SearchFieldWrapper>
  );
};

export default SearchField;
