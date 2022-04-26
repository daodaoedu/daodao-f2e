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
import { IconButton, Box } from "@mui/material";
import MicIcon from "@mui/icons-material/Mic";
import dynamic from "next/dynamic";
const Speech = dynamic(import("../../../../shared/components/Speech"), {
  ssr: false,
});

const SearchToolsWrapper = styled(Box)`
  position: relative;
  height: 40px;
  margin-left: auto;
  margin-right: 5px;
  display: flex;
`;

const SearchButtonWrapper = styled(IconButton)`
  /* position: absolute; */
  overflow: hidden;
  color: white;
  border-radius: 10px;
  float: right;
  height: 100%;
  width: 40px;
  right: 0;
  &:hover {
    /* background-color: #007bbb; */
  }
`;


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
  const [isSpeechMode, setIsSpeechMode] = useState(false);
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
    <SearchInputWrapper
      sx={{
        p: "2px 4px",
        display: "flex",
        alignItems: "center",
        width: 400,
      }}
    >
      <FormWrapper
        action="/search"
        role="/search"
        name="search"
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
          id="q"
          name="q"
          value={keyword}
          placeholder="英語, 心理學, 自主學習 ..."
          onChange={(event) => {
            // setReferenceSelected(null);
            setKeyword(event.target.value);
          }}
          // components={<></>}
        />
      </FormWrapper>
      {isSpeechMode && (
        <Speech lang="zh-tw" setIsSpeechMode={setIsSpeechMode} />
      )}
      <SearchToolsWrapper>
        <SearchButtonWrapper
          sx={{ p: "5px", color: "#16b9b3" }}
          aria-label="speech"
          onClick={() => setIsSpeechMode(true)}
        >
          <MicIcon sx={{ color: "#16b9b3" }} />
        </SearchButtonWrapper>
        <SearchButton routingPush={() => routingPush(keyword)} />
      </SearchToolsWrapper>
    </SearchInputWrapper>
  );
};

export default SearchInput;
