import React from "react";
import { IconButton } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import styled from "@emotion/styled";

const SearchButtonWrapper = styled(IconButton)`
  position: absolute;
  overflow: hidden;
  background-color: #16b9b3;
  color: white;
  width: 80px;
  height: 100%;
  right: 0;
  z-index: 10;
  border-radius: 0;

  &:hover {
    background-color: #16b9b3;
    opacity: 0.8;
    transition: opacity 0.5s;
  }
  @media (max-width: 767px) {
    width: 60px;
    /* border-radius: 20px; */
  }
`;

const SearchButton = ({ routingPush }) => (
  <SearchButtonWrapper
    onClick={() => {
      routingPush();
      // addSearchHistory();
    }}
    sx={{ p: "10px" }}
    aria-label="search"
  >
    <SearchIcon />
  </SearchButtonWrapper>
);

export default SearchButton;
