import { useState, useEffect } from 'react';
import styled from '@emotion/styled';
import InputBase from '@mui/material/InputBase';
import Paper from '@mui/material/Paper';
import IconButton from '@mui/material/IconButton';
import { Search } from 'lucide-react';
import useSearchParamsManager from '@/hooks/useSearchParamsManager';

const SearchInputWrapper = styled(Paper)`
  width: 100%;
  position: relative;
  display: flex;
  align-items: center;
  border: 1px solid #dbdbdb;
  border-radius: 30px;
  padding-right: 4px;
  box-shadow: none;
  overflow: hidden;

  @media (max-width: 767px) {
    border-radius: 20px;
    width: 100%;
  }
`;

const IconButtonWrapper = styled(IconButton)`
  color: #536166;
  border-radius: 40px;
  height: 40px;
  width: 40px;
`;

const InputBaseWrapper = styled(InputBase)(() => ({
  flex: 1,
  '& .MuiInputBase-input': {
    paddingTop: '14px',
    paddingLeft: '20px',
    paddingBottom: '14px',
    background: 'white',
    zIndex: 10,
    borderRadius: '20px',
    width: '100%',
    fontSize: 14,
  },
}));

const SearchInput = () => {
  const [getSearchParams, pushState] = useSearchParamsManager();
  const [keyword, setKeyword] = useState('');
  const currentKeyword = getSearchParams('q').toString();

  useEffect(() => {
    setKeyword(currentKeyword);
  }, [currentKeyword]);

  const handleChange = ({ target }) => {
    setKeyword(target.value);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    pushState('q', keyword);
  };

  return (
    <SearchInputWrapper as="form" onSubmit={handleSubmit}>
      <InputBaseWrapper
        type="search"
        inputProps={{ 'aria-label': 'search partner' }}
        name="q"
        value={keyword}
        placeholder="關鍵字搜尋"
        onChange={handleChange}
      />
      <IconButtonWrapper aria-label="search" type="submit">
        <Search />
      </IconButtonWrapper>
    </SearchInputWrapper>
  );
};

export default SearchInput;
