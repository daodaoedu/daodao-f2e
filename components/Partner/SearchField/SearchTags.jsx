import React, { useState, useEffect } from 'react';
import styled from '@emotion/styled';
import { SEARCH_TAGS } from '@/constants/category';
import useSearchParamsManager from '@/hooks/useSearchParamsManager';

const StyledContainer = styled.div`
  margin-top: 12px;
  display: flex;
  align-items: center;
  width: 100%;
  @media (max-width: 767px) {
    margin-left: 10px 0;
    flex-direction: column;
    align-items: flex-start;
  }
  > p {
    color: #536166;
    font-size: 14px;
    font-style: normal;
    font-weight: 700;
    line-height: 140%;
    white-space: nowrap;
    @media (max-width: 767px) {
      margin-bottom: 8px;
    }
  }
  ul {
    display: flex;
    flex-wrap: nowrap;
    overflow-x: auto;

    -ms-overflow-style: none; /* IE */
    scrollbar-width: none; /* Firefox */
    scroll-behavior: smooth;

    margin-left: 24px;

    &::-webkit-scrollbar {
      display: none; /* Chrome, Safari, Edge and Opera */
    }
    @media (max-width: 767px) {
      margin-left: 0;
    }
  }
  ul > li {
    color: #16b9b3;
    font-size: 14px;
    font-style: normal;
    font-weight: 400;
    line-height: 140%;
    margin-right: 16px;
    flex: 0 0 auto;
    cursor: pointer;
  }
`;

const SearchTags = () => {
  const [getSearchParams, pushState] = useSearchParamsManager();
  const [_, setTag] = useState();
  const currentTags = getSearchParams('tag').toString();

  const handleChange = (val) => {
    pushState('tag', val.toString());
  };

  useEffect(() => {
    setTag(currentTags);
  }, [currentTags]);

  return (
    <StyledContainer>
      <p>熱門標籤</p>
      <ul>
        {SEARCH_TAGS['全部'].map((t) => (
          <li key={t} onClick={() => handleChange(t)}>
            {t}
          </li>
        ))}
      </ul>
    </StyledContainer>
  );
};

export default SearchTags;
