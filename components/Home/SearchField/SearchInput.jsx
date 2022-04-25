import React, { useState, useCallback } from "react";
import { IconButton } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import InputBase from "@mui/material/InputBase";
import Paper from "@mui/material/Paper";
import styled from "@emotion/styled";
import { useRouter } from "next/router";

const SearchInputWrapper = styled(Paper)`
  height: 40px;
  width: 100%;
  padding-top: 10px;
  padding-bottom: 10px;
  position: relative;
  border-radius: 10px;
  border: #ffefef solid 1px;
  background-color: transparent;

  /* @media (max-width: 768px) {
    width: 80%;
    margin: 0 auto;
  } */
`;

const SearchButtonWrapper = styled(IconButton)`
  position: absolute;
  overflow: hidden;
  color: white;
  border-radius: 10px;
  height: 100%;
  width: 60px;
  right: 0;
  &:hover {
    /* background-color: #007bbb; */
  }
`;

const SearchInput = () => {
  // eslint-disable-next-line no-unused-vars
  const [keyword, setKeyword] = useState("");
  const { push } = useRouter();
  const handleKeyPress = useCallback(
    (event) => {
      if (event.key === "Enter" && keyword === "") {
        push(`/search`);
      } else if (event.key === "Enter" && keyword !== "") {
        push(`/search?q=${keyword}`);
      }
    },
    [keyword, push]
  );
  const onSearch = useCallback(() => {
    if (keyword === '') {
        push(`/search`);
    } else if (keyword !== "") {
        push(`/search?q=${keyword}`);
    }
  }, [keyword, push]);

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
      <InputBase
        sx={{
          ml: 1,
          flex: 1,
          width: "100%",
          input: {
            width: "100%",
          },
        }}
        placeholder="今晚，要不要來點＿＿的學習資源？"
        inputProps={{ "aria-label": "search learning resources" }}
        type="search"
        onChange={(event) => setKeyword(event.target.value)}
        style={{
          color: "white",
          fontWeight: "500",
          paddingLeft: "5px",
        }}
        onKeyPress={handleKeyPress}
      />
      <SearchButtonWrapper
        sx={{ p: "10px" }}
        aria-label="search"
        onClick={onSearch}
      >
        <SearchIcon />
      </SearchButtonWrapper>
    </SearchInputWrapper>
  );
};

export default SearchInput;
