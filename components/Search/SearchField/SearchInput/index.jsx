import React, { useState, useEffect, useCallback } from "react";
// import ClickAwayListener from "@mui/base/ClickAwayListener";
import InputBase from "@mui/material/InputBase";
import Paper from "@mui/material/Paper";
import styled from "@emotion/styled";
// import { Search } from "@mui/icons-material";
import { useRouter } from "next/router";
import SearchButton from "./Button";
// import i18n from "../../../../../constants/i18n";
// import SuggestList from "./SuggestList";

const FormWrapper = styled.form`
  width: 100%;
`;

const SearchInputWrapper = styled(Paper)`
  height: 40px;
  max-width: 1000px;
  width: 80%;
  position: relative;
  border-radius: 10px;
  border: 2px solid #16b9b3;
  box-shadow: none;
  overflow: hidden;

  @media (max-width: 767px) {
    border-radius: 20px;
    width: 100%;
  }
`;

const InputBaseWrapper = styled(InputBase)`
  background: white;
  z-index: 10;
  border-bottom-right-radius: 20px;
  border-top-right-radius: 20px;
  margin-left: 10px;
  width: 100%;

  @media (max-width: 767px) {
    border-radius: 20px;
  }
`;

const SearchInput = () => {
  const { query, push } = useRouter();
  // const isServerSide = useMemo(() => !process.browser, []);
  const [keyword, setKeyword] = useState(query?.q);
  // const [referenceSelected, setReferenceSelected] = useState(null);

  useEffect(() => {
    setKeyword(query?.q ?? "");
  }, [query?.q]);

  const routingPush = useCallback(
    (words) => {
      if (words !== "") {
        push({
          query: {
            ...query,
            q: words,
          },
        });
      } else {
        delete query.q;
        push({
          query,
        });
      }
    },
    [push, query]
  );

  return (
    // <ClickAwayListener>
    <SearchInputWrapper
      sx={{
        p: "2px 4px",
        display: "flex",
        alignItems: "center",
        width: 400,
      }}
    >
      <FormWrapper
        action
        onSubmit={(e) => {
          e.preventDefault();
          if (keyword !== "") {
            push({
              query: {
                ...query,
                q: keyword,
              },
            });
          } else if (keyword.length === 0) {
            delete query.q;
            push({ query });
          }
        }}
      >
      <InputBaseWrapper
        type="search"
        inputProps={{ "aria-label": "search learning resources" }}
        id="search_term_string"
        name="search_term_string"
        value={keyword}
        placeholder="英語, 心理學, 自主學習 ..."
        onChange={(event) => {
          // setReferenceSelected(null);
          setKeyword(event.target.value);
        }}
        // components={<></>}
      />
      </FormWrapper>
      {/* <Search
        sx={{
          position: "absolute",
          left: "12px",
          top: "20%",
          color: "#37b9eb",
          zIndex: 15,
          // transform: "translate(0,-25%)",
        }}
      /> */}
      <SearchButton
        routingPush={() => routingPush(keyword)}
        // addSearchHistory={() =>
        //   addSearchHistory(referenceList[referenceSelected] || keyword)
        // }
      />

      {/* <SuggestList
          isFocus={isFocus}
          keyword={keyword}
          addSearchHistory={addSearchHistory}
          referenceSelected={referenceSelected}
        /> */}
    </SearchInputWrapper>
    // </ClickAwayListener>
  );
};

export default SearchInput;
