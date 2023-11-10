import { useCallback, useMemo, useRef, useState } from 'react';
import styled from '@emotion/styled';
import { CATEGORIES } from '@/constants/category';
import useSearchParamsManager from '@/hooks/useSearchParamsManager';
import ScrollButton from '@/shared/components/ScrollButton';
import Chip from '@/shared/components/Chip';

const StyledSelectedCategory = styled.div`
  margin-top: 12px;
  display: flex;
  align-items: center;

  > p {
    margin-right: 20px;
    font-weight: 700;
    font-size: 14px;
    color: #536166;
    flex-shrink: 0;
  }

  > div {
    position: relative;
    max-width: calc(100% - 76px);
  }

  ul {
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
    <StyledSelectedCategory>
      <p>學習領域</p>
      <div
        onBlur={resetScrollButtonVisibility}
        onFocus={updateScrollButtonVisibility}
        onMouseOver={updateScrollButtonVisibility}
        onMouseLeave={resetScrollButtonVisibility}
      >
        <ScrollButton
          type="left"
          isShowScrollButton={isShowLeftScrollButton}
          onScrollEvent={scrollButtonHandler('left')}
        />
        <ul ref={categoryListRef} onScroll={updateScrollButtonVisibility}>
          <li>
            <Chip
              value="全部"
              isActive={currentCategories.length === 0}
              onClick={() => pushState('category')}
            />
          </li>
          {CATEGORIES.map(({ key, value }) => (
            <li key={key}>
              <Chip
                value={value}
                isActive={currentCategories.includes(value)}
                onClick={handleClickCategory}
              />
            </li>
          ))}
        </ul>
        <ScrollButton
          type="right"
          isShowScrollButton={isShowRightScrollButton}
          onScrollEvent={scrollButtonHandler('right')}
        />
      </div>
    </StyledSelectedCategory>
  );
};

export default SelectedCategory;
