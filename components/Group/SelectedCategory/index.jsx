import { useCallback, useMemo, useRef, useState } from 'react';
import styled from '@emotion/styled';
import { Box, Typography } from '@mui/material';
import { CATEGORIES } from '@/constants/category';
import ScrollButton from '@/shared/components/ScrollButton';
import useSearchParamsManager from '@/hooks/useSearchParamsManager';
import CategoryChip from './CategoryChip';

const ListWrapper = styled.ul`
  display: flex;
  overflow-x: scroll;
  -ms-overflow-style: none; /* IE */
  scrollbar-width: none; /* Firefox */
  scroll-behavior: smooth;
  &::-webkit-scrollbar {
    display: none; /* Chrome, Safari, Edge and Opera */
  }

  @media (max-width: 767px) {
    margin: 10px 0;
  }
`;

const SelectedCategory = () => {
  /** @type {React.MutableRefObject<Element>} */
  const categoryListRef = useRef(null);
  const [getSearchParams, pushState] = useSearchParamsManager();
  const [isShowLeftScrollButton, setIsShowLeftScrollButton] = useState(false);
  const [isShowRightScrollButton, setIsShowRightScrollButton] = useState(false);

  const currentCategories = useMemo(
    () => getSearchParams('category'),
    [getSearchParams],
  );

  const handleClickCategory = useCallback(
    (event) => {
      const targetCategory = event.target.textContent;
      const hasCategory = currentCategories.includes(targetCategory);
      const categories = hasCategory
        ? currentCategories.filter((category) => category !== targetCategory)
        : [...currentCategories, targetCategory];

      pushState('category', categories.toString());
    },
    [pushState, currentCategories],
  );

  const updateScrollButtonVisibility = () => {
    const { scrollLeft, scrollWidth, clientWidth } = categoryListRef.current;
    const isStart = Math.floor(scrollLeft) <= 0;
    const isEnd = Math.ceil(scrollLeft + clientWidth) >= scrollWidth;

    setIsShowLeftScrollButton(!isStart);
    setIsShowRightScrollButton(!isEnd);
  };

  const resetScrollButtonVisibility = () => {
    setIsShowLeftScrollButton(false);
    setIsShowRightScrollButton(false);
  };

  const scrollButtonHandler = (type) => () => {
    const delta = categoryListRef.current.offsetWidth + 100;

    if (type === 'left') {
      categoryListRef.current.scrollLeft -= delta;
    } else if (type === 'right') {
      categoryListRef.current.scrollLeft += delta;
    }
  };

  return (
    <Box
      sx={{
        marginTop: '12px',
        display: 'flex',
        alignItems: 'center',
      }}
    >
      <Typography
        sx={{
          marginRight: '20px',
          fontWeight: 700,
          fontSize: '14px',
          color: '#536166',
          flexShrink: '0',
        }}
      >
        學習領域
      </Typography>
      <Box
        sx={{ position: 'relative', maxWidth: 'calc(100% - 76px)' }}
        onMouseOver={updateScrollButtonVisibility}
        onMouseLeave={resetScrollButtonVisibility}
      >
        <ScrollButton
          type="left"
          isShowScrollButton={isShowLeftScrollButton}
          onScrollEvent={scrollButtonHandler('left')}
        />
        <ListWrapper
          ref={categoryListRef}
          onScroll={updateScrollButtonVisibility}
        >
          <CategoryChip
            value="全部"
            isActive={currentCategories.length === 0}
            onClick={() => pushState('category')}
          />
          {CATEGORIES.map(({ key, value }) => (
            <CategoryChip
              key={key}
              value={value}
              isActive={currentCategories.includes(value)}
              onClick={handleClickCategory}
            />
          ))}
        </ListWrapper>
        <ScrollButton
          type="right"
          isShowScrollButton={isShowRightScrollButton}
          onScrollEvent={scrollButtonHandler('right')}
        />
      </Box>
    </Box>
  );
};

export default SelectedCategory;
