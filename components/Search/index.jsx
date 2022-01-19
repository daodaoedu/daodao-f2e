import React, { useMemo } from "react";
import styled from "@emotion/styled";
import { useRouter } from "next/router";
import useSWR from "swr";
import { Box } from "@mui/material";
import SearchResultList from "./SearchResultList";
import SearchField from "../../shared/components/SearchField";
import { postFetcher } from "../../utils/fetcher";
import { bodyHandler, searchTypeHandler } from "../../utils/notion";
import stringSanitizer from "../../utils/sanitizer";
import SelectedTags from "./SelectedTags";
import SelectedCategory from "./SelectedCategory";

const SearchWrapper = styled.div`
  height: 100%;
  min-height: calc(100vh - 80px);
  .header-title {
    font-size: 26px;
    font-weight: 500;
  }
`;

const Search = () => {
  const router = useRouter();
  const queryTags = useMemo(
    () =>
      typeof router.query.tags === "string"
        ? stringSanitizer(router.query.tags).split(",")
        : [],
    [router.query.tags]
  );
  const keyword = useMemo(
    () => stringSanitizer(router.query.q),
    [router.query.q]
  );
  const cats = useMemo(
    () => stringSanitizer(router.query.cats),
    [router.query.cats]
  );
  const { data } = useSWR(
    [
      `https://api.daoedu.tw/notion/databases/${searchTypeHandler(cats)}`,
      bodyHandler(keyword, queryTags),
    ],
    postFetcher
  );
  const isLoading = !data;
  return (
    <SearchWrapper>
      <SelectedCategory queryTags={queryTags} />
      <SearchField />
      <Box
        sx={{
          margin: "20px 0 20px 0",
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          "& > .header-result": {
            marginLeft: "20px",
            fontSize: "20px",
          },
        }}
      >
        <h1 className="header-title">搜尋結果</h1>
        {Array.isArray(data?.payload?.results) && (
          <p className="header-result">共{data?.payload?.results.length}筆</p>
        )}
      </Box>
      <SelectedTags queryTags={queryTags} />

      <SearchResultList
        list={data?.payload?.results ?? []}
        isLoading={isLoading}
        queryTags={queryTags}
      />
    </SearchWrapper>
  );
};

export default Search;
