import React from "react";
import { IconButton } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import styled from "@emotion/styled";

const SearchButtonWrapper = styled(IconButton)`
  position: absolute;
  overflow: hidden;
  background-color: #007bbb;
  color: white;
  border-radius: 10px;
  width: 80px;
  height: 100%;
  right: 0;
  z-index: 20;

  &:hover {
    background-color: #007bbb;
  }
  @media (max-width: 767px) {
    width: 60px;
    border-radius: 20px;
  }
`;

const SearchButton = ({ routingPush, addSearchHistory }) => (
  <SearchButtonWrapper
    onClick={() => {
      routingPush();
      addSearchHistory();
    }}
    sx={{ p: "10px" }}
    aria-label="search"
  >
    <SearchIcon />
  </SearchButtonWrapper>
);

export default SearchButton;
