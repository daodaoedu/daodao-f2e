import React, { useCallback, useMemo, useRef } from 'react';
import styled from '@emotion/styled';
import { useRouter } from 'next/router';
import { Box, Divider } from '@mui/material';
import { useSearchResults } from '@/services/notion';
import SearchResultList from './SearchResultList';
import SearchField from './SearchField';
import stringSanitizer from '../../utils/sanitizer';
import SelectedTags from './SelectedTags';
import SelectedCategory from './SelectedCategory';
import useIntersectionObserver from '../../hooks/useIntersectionObserver';
import SearchFooter from './SearchFooter';
import ScrollToTop from '../../shared/components/ScrollToTop';

const SearchWrapper = styled.div`
  position: relative;
  height: 100%;
  min-height: calc(100vh - 80px);
  .header-title {
    font-size: 24px;
    font-weight: 500;
  }
`;

const Search = () => {
  const router = useRouter();
  const loadMoreButtonRef = useRef();

  const queryTags = useMemo(
    () =>
      typeof router.query.tags === 'string'
        ? stringSanitizer(router.query.tags).split(',')
        : [],
    [router?.query?.tags],
  );

  const { searchResults, hasMore, nextCursor, isLoading, isValidating, setSize } = useSearchResults(router?.query);

  const handleLoadMore = useCallback(() => {
    setSize((pre) => pre + 1);
  }, [setSize]);

  useIntersectionObserver({
    enabled: !isLoading && !isValidating && nextCursor && hasMore,
    target: loadMoreButtonRef,
    onIntersect: handleLoadMore,
    threshold: 0.3,
  });

  return (
    <SearchWrapper>
      {/* 搜尋條件 */}
      <SelectedCategory />
      <SearchField />
      <Divider
        sx={{
          margin: '10px 0',
        }}
      />
      {/* 搜尋結果 */}

      <Box
        sx={{
          margin: '10px 0',
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          '& > .header-result': {
            marginLeft: '20px',
            fontSize: '20px',
          },
        }}
      >
        <h1 className="header-title"> 搜尋結果</h1>
        {!isValidating && !isLoading && Array.isArray(searchResults) && (
          <p className="header-result">
            共 {searchResults.length} 筆{nextCursor && '以上'}
          </p>
        )}
      </Box>
      <SelectedTags query={router.query} />
      <SearchResultList
        list={searchResults}
        isLoading={isLoading}
        isLoadingNextData={isValidating}
        queryTags={queryTags}
      />
      <SearchFooter
        hasMoredata={nextCursor}
        loadMoreButtonRef={loadMoreButtonRef}
        isLoading={isLoading}
        isLoadingNextData={isValidating}
      />
      <ScrollToTop />
    </SearchWrapper>
  );
};

export default Search;
