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

  // const addSearchHistory = useCallback(
  //   (word) => {
  //     if (isServerSide) {
  //       return [];
  //     }
  //     const list =
  //       JSON.parse(window?.localStorage.getItem("historyKeywords") || null) ||
  //       [];
  //     if (keyword !== "") {
  //       window?.localStorage.setItem(
  //         "historyKeywords",
  //         JSON.stringify([
  //           ...(Array.isArray(list) && list.length > 0 ? list : []),
  //           {
  //             id: Array.isArray(list) ? list.length : 0,
  //             keyword: word,
  //           },
  //         ])
  //       );
  //     }
  //     if (Array.isArray(list) && list.length >= 10) {
  //       window?.localStorage.setItem(
  //         "historyKeywords",
  //         JSON.stringify([
  //           ...(list.length > 0 ? list.slice(1) : []),
  //           {
  //             id: list[list.length - 1].id + 1,
  //             keyword: word,
  //           },
  //         ])
  //       );
  //     }
  //     return [];
  //   },
  //   [isServerSide, keyword]
  // );

  // const [isFocus, setIsFocus] = useState(false);
  const handleKeyPress = useCallback(
    (event) => {
      if (event.key === "Enter" && keyword !== "") {
        push({
          query: {
            ...query,
            q: keyword,
          },
        });
      }
      if (!query.q) {
        delete query.q;
      }
      // else if (event.key === "Enter" && keyword === "") {
      //   delete query.q;
      //   push({
      //     query,
      //   });
      // }
    },
    [keyword, push, query]
  );

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
      <InputBaseWrapper
        inputProps={{ "aria-label": "search google maps" }}
        value={keyword}
        onKeyPress={handleKeyPress}
        onChange={(event) => {
          // setReferenceSelected(null);
          setKeyword(event.target.value);
        }}
      />
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
