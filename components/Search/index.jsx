import React, { useMemo } from "react";
import styled from "@emotion/styled";
import { useRouter } from "next/router";
// import useSWR from "swr";
import useSWRImmutable from "swr/immutable";
import { Box } from "@mui/material";
import SearchResultList from "./SearchResultList";
import SearchField from "../../shared/components/SearchField";
import { postFetcher } from "../../utils/fetcher";
import { bodyHandler } from "../../utils/notion";
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
  const { query } = useRouter();
  const { data } = useSWRImmutable(
    [`https://api.daoedu.tw/notion/databases`, bodyHandler(query)],
    postFetcher
  );
  const queryTags = useMemo(
    () =>
      typeof query.tags === "string"
        ? stringSanitizer(query.tags).split(",")
        : [],
    [query.tags]
  );

  const isLoading = !data;
  const isError = data?.payload?.object === "error";
  const hasMoredata = data?.payload?.has_more;
  const errorMessage = data?.payload?.message;
  console.log("data", data);
  return (
    <SearchWrapper>
      <SelectedCategory />
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
          <p className="header-result">
            共{data?.payload?.results.length}
            {hasMoredata && "+"}筆
          </p>
        )}
      </Box>
      <SelectedTags query={query} />
      {isError ? (
        <>
          <p>出問題囉：{errorMessage}</p>
        </>
      ) : (
        <SearchResultList
          list={data?.payload?.results ?? []}
          isLoading={isLoading}
          queryTags={queryTags}
        />
      )}
      {!isError && !hasMoredata && (
        <Box sx={{ margin: "20px" }}>已經抵達無人島囉～</Box>
      )}
    </SearchWrapper>
  );
};

export default Search;
