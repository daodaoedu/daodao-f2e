import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import styled from '@emotion/styled';
import InputBase from '@mui/material/InputBase';
import Paper from '@mui/material/Paper';
import IconButton from '@mui/material/IconButton';
import MicIcon from '@mui/icons-material/Mic';
import SearchIcon from '@mui/icons-material/Search';
import useSearchParamsManager from '@/hooks/useSearchParamsManager';

const Speech = dynamic(import('@/shared/components/Speech'), {
  ssr: false,
});

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
  const [isSpeechMode, setIsSpeechMode] = useState(false);
  const currentKeyword = getSearchParams('q').toString();

  useEffect(() => {
    setKeyword(currentKeyword);
  }, [currentKeyword]);

  const handleChange = ({ target }) => {
    setKeyword(target.value);
  };

  /** @type {(event: SubmitEvent) => void} */
  const handleSubmit = (event) => {
    event.preventDefault();
    pushState('q', keyword);
  };

  return (
    <SearchInputWrapper as="form" onSubmit={handleSubmit}>
      <InputBaseWrapper
        type="search"
        inputProps={{ 'aria-label': 'search group' }}
        name="q"
        value={keyword}
        placeholder="想尋找甚麼類型的揪團呢？"
        onChange={handleChange}
      />
      {isSpeechMode && (
        <Speech lang="zh-tw" setIsSpeechMode={setIsSpeechMode} />
      )}
      <IconButtonWrapper
        aria-label="speech"
        onClick={() => setIsSpeechMode(true)}
      >
        <MicIcon />
      </IconButtonWrapper>
      <IconButtonWrapper aria-label="search" type="submit">
        <SearchIcon />
      </IconButtonWrapper>
    </SearchInputWrapper>
  );
};

export default SearchInput;
