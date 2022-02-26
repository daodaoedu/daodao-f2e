import React from "react";
import styled from "@emotion/styled";
import SearchInput from "./SearchInput";
import Tags from "./Tags";

const SearchFieldWrapper = styled.div`
  margin: auto;
  margin-top: 40px;
  display: flex;
  flex-direction: column;
  width: 500px;
  @media (max-width: 768px) {
    width: 100%;
  }
`;

const TrendingWrapper = styled.div`
  display: flex;
  justify-content: flex-start;
  margin-top: 20px;
`;

const SearchField = () => (
  <SearchFieldWrapper>
    <SearchInput />
    <TrendingWrapper>
      <Tags />
    </TrendingWrapper>
  </SearchFieldWrapper>
);

export default SearchField;
