import React, {
  useMemo,
  useEffect,
  useState,
  useRef,
  useCallback,
} from "react";
import styled from "@emotion/styled";
import { useRouter } from "next/router";
import { Box } from "@mui/material";
import SearchResultList from "./SearchResultList";
import SearchField from "./SearchField";
// import { postFetcher } from "../../utils/fetcher";
import { bodyHandler } from "../../utils/notion";
import stringSanitizer from "../../utils/sanitizer";
import SelectedTags from "./SelectedTags";
import SelectedCategory from "./SelectedCategory";
import useIntersectionObserver from "../../hooks/useIntersectionObserver";
import SearchFooter from "./SearchFooter";
import { useSelector, useDispatch } from "react-redux";
import {
  loadSearchResult,
  loadNextSearchResult,
} from "../../redux/actions/search";
import ScrollToTop from "../../shared/components/ScrollToTop";
import { Divider } from "@mui/material";
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
  const dispatch = useDispatch();
  const { results, isLoading, next_cursor, isLoadingNextData, has_more } =
    useSelector((state) => state?.search ?? {});
  const router = useRouter();
  const loadMoreButtonRef = useRef();

  const queryTags = useMemo(
    () =>
      typeof router.query.tags === "string"
        ? stringSanitizer(router.query.tags).split(",")
        : [],
    [router?.query?.tags]
  );

  const onIntersect = useCallback(() => {
    if (router.isReady) {
      dispatch(loadNextSearchResult(bodyHandler(router?.query, next_cursor)));
    }
  }, [dispatch, next_cursor, router.isReady, router?.query]);

  useIntersectionObserver({
    enabled: !isLoadingNextData && next_cursor && has_more,
    target: loadMoreButtonRef,
    onIntersect,
    threshold: 0.3,
  });

  useEffect(() => {
    if (router.isReady) {
      dispatch(loadSearchResult(bodyHandler(router?.query)));
    }
  }, [dispatch, router.isReady, router?.query, router?.tags]);

  return (
    <SearchWrapper>
      {/* 搜尋條件 */}
      <SelectedCategory />
      <SearchField />
      <Divider
        sx={{
          margin: "10px 0",
        }}
      />
      {/* 搜尋結果 */}

      <Box
        sx={{
          margin: "10px 0",
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
        {!isLoadingNextData && !isLoading && Array.isArray(results) && (
          <p className="header-result">
            共 {results.length} 筆{next_cursor && "以上"}
          </p>
        )}
      </Box>
      <SelectedTags query={router.query} />
      <SearchResultList
        list={results}
        isLoading={isLoading}
        isLoadingNextData={isLoadingNextData}
        queryTags={queryTags}
      />
      <SearchFooter
        hasMoredata={next_cursor}
        loadMoreButtonRef={loadMoreButtonRef}
        isLoading={isLoading}
        isLoadingNextData={isLoadingNextData}
        // isError={isError}
        // errorMessage={errorMessage}
      />
      <ScrollToTop />
    </SearchWrapper>
  );
};

export default Search;
