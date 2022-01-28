import React, {
  useMemo,
  useEffect,
  useState,
  useRef,
  useCallback,
} from "react";
import styled from "@emotion/styled";
import { useRouter } from "next/router";
// import useSWR from "swr";
import useSWRImmutable from "swr/immutable";
import { Box } from "@mui/material";
import SearchResultList from "./SearchResultList";
import SearchField from "./SearchField";
import { postFetcher } from "../../utils/fetcher";
import { bodyHandler } from "../../utils/notion";
import stringSanitizer from "../../utils/sanitizer";
import SelectedTags from "./SelectedTags";
import SelectedCategory from "./SelectedCategory";
import useIntersectionObserver from "../../hooks/useIntersectionObserver";
import SearchFooter from "./SearchFooter";

const SearchWrapper = styled.div`
  position: relative;
  height: 100%;
  min-height: calc(100vh - 80px);
  .header-title {
    font-size: 26px;
    font-weight: 500;
  }
`;

const Search = () => {
  const { query } = useRouter();
  const loadMoreButtonRef = useRef();
  const [nextCursor, setNextCursor] = useState(null);
  const { data = [] } = useSWRImmutable(
    [`https://api.daoedu.tw/notion/databases`, bodyHandler(query, nextCursor)],
    postFetcher
  );
  console.log("nextCursor", nextCursor);
  const [previewList, setPreviewList] = useState(
    () => data?.payload?.results ?? []
  );
  const queryTags = useMemo(
    () =>
      typeof query.tags === "string"
        ? stringSanitizer(query.tags).split(",")
        : [],
    [query.tags]
  );
  const isLoadingMoreData = useMemo(() => data.length === 0, [data]);
  // const isLoadingPreviewList = useMemo(
  //   () => previewList.length === 0,
  //   [previewList]
  // );
  const isError = useMemo(
    () => data?.payload?.object === "error",
    [data?.payload?.object]
  );
  const hasMoredata = useMemo(
    () => data?.payload?.has_more,
    [data?.payload?.has_more]
  );
  const errorMessage = useMemo(
    () => data?.payload?.message,
    [data?.payload?.message]
  );

  useEffect(() => {
    if (
      Array.isArray(data?.payload?.results) &&
      data?.payload?.results.length > 0
    ) {
      setPreviewList((prevList) => [
        ...new Set([...prevList, ...(data?.payload?.results ?? [])]),
      ]);
    }
  }, [data, setPreviewList]);

  const onIntersect = useCallback(() => {
    setNextCursor(data?.payload?.next_cursor);
  }, [setNextCursor, data?.payload?.next_cursor]);

  useIntersectionObserver({
    enabled: !isLoadingMoreData,
    target: loadMoreButtonRef,
    onIntersect,
    threshold: 0.3,
  });

  console.log("data", data);

  console.log("nextCursor", nextCursor);
  return (
    <SearchWrapper>
      <SelectedCategory />
      <SearchField />
      <SelectedTags query={query} />
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
        {Array.isArray(previewList) && (
          <p className="header-result">
            共
            {/* {data?.payload?.results.length}
             */}
            {previewList.length}筆{hasMoredata && "以上"}
          </p>
        )}
      </Box>

      <SearchResultList
        list={previewList}
        isLoading={isLoadingMoreData}
        // isLoadingMoreData={isLoadingMoreData}
        queryTags={queryTags}
      />
      <SearchFooter
        hasMoredata={hasMoredata}
        loadMoreButtonRef={loadMoreButtonRef}
        isError={isError}
        errorMessage={errorMessage}
      />
    </SearchWrapper>
  );
};

export default Search;
