import React from "react";
import styled from "@emotion/styled";
import { Box } from "@mui/material";
import { useRouter } from "next/router";
import { Whatshot } from "@mui/icons-material";
import HotTags from "./HotTags";
import SearchInput from "./Input";
import { SEARCH_TAGS } from "../../../constants/category";

const SearchFieldWrapper = styled.div`
  width: 80%;

  @media (max-width: 767px) {
    width: 100%;
  }

  /* @media (max-width: 767px) {
    margin: 0 10px 10px 10px;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    width: 100%;
  } */
`;

const SearchField = () => {
  const { query } = useRouter();
  const queryList = (query?.cats ?? "").split(",").reverse();
  return (
    <SearchFieldWrapper>
      <SearchInput />
      <HotTags queryList={queryList} />
    </SearchFieldWrapper>
  );
};

export default SearchField;
