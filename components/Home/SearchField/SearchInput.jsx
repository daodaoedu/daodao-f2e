import React, { useState, useCallback, useMemo } from "react";
import { IconButton, Box } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import MicIcon from "@mui/icons-material/Mic";
import InputBase from "@mui/material/InputBase";
import Paper from "@mui/material/Paper";
import styled from "@emotion/styled";
import { useRouter } from "next/router";
import dynamic from "next/dynamic";
const Speech = dynamic(import("../../../shared/components/Speech"), {
  ssr: false,
});
// import { FormControl } from "@mui/material";

const FormWrapper = styled.form`
  width: 100%;
`;

const PLACEHOLDER_TEXT = [
  "今晚，要不要來點 ＿＿ 的學習資源？",
  "有好多令人興奮的事情在發生 ❗️",
  "學膩了學科嗎，要不要來點別的？",
  "有事沒事搜尋一下，增廣見聞 ➡️",
];

const SearchToolsWrapper = styled(Box)`
  position: relative;
  height: 40px;
  margin-left: auto;
  margin-right: 5px;
  display: flex;
`;

const SearchInputWrapper = styled(Paper)`
  border-radius: 10px;
  border: #ffefef solid 1px;
  background-color: transparent;
  /* @media (max-width: 768px) {
    width: 80%;
    margin: 0 auto;
  } */
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

const SearchInput = () => {
  // eslint-disable-next-line no-unused-vars
  const [keyword, setKeyword] = useState("");
  const [isSpeechMode, setIsSpeechMode] = useState(false);
  const { push } = useRouter();
  const onSearch = useCallback(() => {
    if (keyword === '') {
        push(`/search`);
    } else if (keyword !== "") {
        push(`/search?q=${keyword}`);
    }
  }, [keyword, push]);

  const placeholder = useMemo(
    () => PLACEHOLDER_TEXT[Math.floor(Math.random() * 4)],
    []
  );

  return (
    <SearchInputWrapper
      sx={{
        p: "2px 4px",
        display: "flex",
        alignItems: "center",
        width: "100%",
        // width: 400,
      }}
    >
      <FormWrapper
        action="/search"
        role="/search"
        name="search"
        onSubmit={(e) => {
          e.preventDefault();
          if (keyword === "") {
            push(`/search`);
          } else if (keyword !== "") {
            push(`/search?q=${keyword}`);
          }
        }}
      >
        <InputBase
          sx={{
            ml: 1,
            flex: 1,
            width: "100%",
            input: {
              width: "100%",
            },
          }}
          id="q"
          name="q"
          placeholder={placeholder}
          inputProps={{ "aria-label": "search learning resources" }}
          type="search"
          onChange={(event) => setKeyword(event.target.value)}
          style={{
            color: "white",
            fontWeight: "500",
            paddingLeft: "5px",
          }}
        />
      </FormWrapper>
      {isSpeechMode && (
        <Speech lang="zh-tw" setIsSpeechMode={setIsSpeechMode} />
      )}
      <SearchToolsWrapper>
        <SearchButtonWrapper
          sx={{ p: "5px" }}
          aria-label="speech"
          onClick={() => setIsSpeechMode(true)}
        >
          <MicIcon />
        </SearchButtonWrapper>
        <SearchButtonWrapper
          sx={{ p: "5px" }}
          aria-label="search"
          onClick={onSearch}
        >
          <SearchIcon />
        </SearchButtonWrapper>
      </SearchToolsWrapper>
    </SearchInputWrapper>
  );
};

export default SearchInput;
