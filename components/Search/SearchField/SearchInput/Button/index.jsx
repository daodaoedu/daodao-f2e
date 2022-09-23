import React from 'react';
import { IconButton } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import styled from '@emotion/styled';

const SearchButtonWrapper = styled(IconButton)`
  overflow: hidden;
  color: #16b9b3;
  width: 40px;
  height: 100%;
  right: 0;
  border-radius: 0;
  padding: 10px;

  &:hover {
    background-color: white;
    /* opacity: 0.8;
    transition: opacity 0.5s; */
  }
  @media (max-width: 767px) {
    width: 40px;
    padding: 0px;
    /* border-radius: 20px; */
  }
`;

const SearchButton = ({ routingPush }) => (
  <SearchButtonWrapper
    onClick={() => {
      routingPush();
      // addSearchHistory();
    }}
    aria-label="search"
  >
    <SearchIcon />
  </SearchButtonWrapper>
);

export default SearchButton;
