import React, { useMemo } from "react";
import styled from "@emotion/styled";
import { useRouter } from "next/router";
import useSWR from "swr";
import { Stack } from "@mui/material";
import List from "./List";
import SearchField from "../../shared/components/SearchField";
import { postFetcher } from "../../utils/fetcher";
import { bodyHandler } from "../../utils/notion";
import stringSanitizer from "../../utils/sanitizer";
import SelectedTags from "./SelectedTags";

const SearchWrapper = styled.div`
  height: 100%;
  min-height: calc(100vh - 80px);
  .header-title {
    font-size: 30px;
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
  const { data } = useSWR(
    [
      `https://api.daoedu.tw/notion/databases/da015b1a389b43cda9f01876294064e0`,
      bodyHandler(keyword, queryTags),
    ],
    postFetcher
  );
  const isLoading = !data;
  return (
    <SearchWrapper>
      <SearchField />
      <Stack
        sx={{
          margin: "50px 0 20px 0",
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          "& > .header-result": {
            marginLeft: "20px",
            fontSize: "24px",
          },
        }}
      >
        <h1 className="header-title">搜尋結果</h1>
        {Array.isArray(data?.payload?.results) && (
          <p className="header-result">共{data?.payload?.results.length}筆</p>
        )}
      </Stack>
      <SelectedTags queryTags={queryTags} />

      <List
        list={data?.payload?.results ?? []}
        isLoading={isLoading}
        queryTags={queryTags}
      />
    </SearchWrapper>
  );
};

export default Search;
