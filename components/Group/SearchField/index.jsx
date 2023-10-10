import { memo } from 'react';
import styled from '@emotion/styled';
import Box from '@mui/material/Box';
import SearchInput from './SearchInput';
import SelectedAreas from './SelectedAreas';
import {
  SelectedInitiatorEducationStep,
  SelectedPartnerEducationStep,
} from './SelectedEducationStep';

const SearchFieldWrapper = styled.div`
  margin-top: 8px;
  width: 100%;
`;

const SearchField = () => {
  return (
    <SearchFieldWrapper>
      <SearchInput />
      <Box
        sx={{
          marginTop: '12px',
          display: 'flex',
          justifyContent: 'flex-start',
          alignItems: 'center',
          gap: 2,
          '@media (max-width: 767px)': {
            margin: '10px 0',
            flexDirection: 'column',
            alignItems: 'stretch',
          },
        }}
      >
        <SelectedAreas />
        <SelectedInitiatorEducationStep />
        <SelectedPartnerEducationStep />
      </Box>
    </SearchFieldWrapper>
  );
};

export default memo(SearchField);
