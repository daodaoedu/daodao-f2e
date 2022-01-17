import React, { useMemo } from "react";
import styled from "@emotion/styled";
import { useRouter } from "next/router";
import useSWR from "swr";
import List from "./List";
import SearchField from "../../shared/components/SearchField";
import { postFetcher } from "../../utils/fetcher";
import { bodyHandler } from "../../utils/notion";
import stringSanitizer from "../../utils/sanitizer";

const SearchWrapper = styled.div`
  height: 100%;
  min-height: calc(100vh - 80px);
  & > .title {
    font-size: 30px;
    font-weight: 500;
  }
`;

const Search = () => {
  const router = useRouter();
  const tag = useMemo(
    () => stringSanitizer(router.query.tag),
    [router.query.tag]
  );
  const keyword = useMemo(
    () => stringSanitizer(router.query.q),
    [router.query.q]
  );
  const { data } = useSWR(
    [
      `https://api.daoedu.tw/notion/databases/da015b1a389b43cda9f01876294064e0`,
      bodyHandler(keyword, tag),
    ],
    postFetcher
  );
  const isLoading = !data;
  console.log("data", data);
  console.log(bodyHandler(keyword, tag));
  return (
    <SearchWrapper>
      <SearchField />
      <h1 className="title">搜尋結果</h1>
      {Array.isArray(data?.payload?.results) && (
        <p>共{data?.payload?.results.length}筆</p>
      )}
      <List list={data?.payload?.results ?? []} isLoading={isLoading} />
    </SearchWrapper>
  );
};

export default Search;
