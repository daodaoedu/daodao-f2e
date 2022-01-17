import React from "react";
import styled from "@emotion/styled";
// import Tags from "./Tags";
import SearchInput from "./Input";

const SearchFieldWrapper = styled.div`
  width: 80%;

  /* @media (max-width: 767px) {
    margin: 0 10px 10px 10px;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    width: 100%;
  } */
`;

const SearchField = () => {
  return (
    <SearchFieldWrapper>
      <SearchInput />
    </SearchFieldWrapper>
  );
};

export default SearchField;
