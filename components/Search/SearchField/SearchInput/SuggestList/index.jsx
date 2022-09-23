import React from 'react';
import styled from '@emotion/styled';
import { css } from '@emotion/react';
import Link from 'next/link';

const SuggestWrapper = styled.div`
  width: 100%;
  top: 20px;
  left: 0px;
  background-color: white;
  position: absolute;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  border-bottom-left-radius: 10px;
  border-bottom-right-radius: 10px;
  border: 2px #37b9eb solid;
  overflow: hidden;
  border-top: 0;
  /* box-shadow: 0 4px 6px rgb(32 33 36 / 28%); */
  ${({ isFocus, isEmpty }) =>
    isFocus &&
    !isEmpty &&
    css`
      border: 0px;
    `}

  a {
    display: block;
    padding: 6px 12px;
    color: black;

    &:hover {
      background-color: #eeeeee;
    }

    &:first-of-type {
      margin-top: 15px;
    }

    &:last-of-type {
      border-bottom-left-radius: 10px;
      border-bottom-right-radius: 10px;
    }
  }
`;

const SuggestList = ({
  isFocus,
  keyword,
  suggestKeywords,
  addSearchHistory,
  referenceSelected,
}) => {
  const isServerSide = !process.browser;
  if (isServerSide) return <></>;
  const historyKeywords =
    JSON.parse(window?.localStorage.getItem('historyKeywords') || null) || [];

  if (!isFocus) return <></>;

  if (keyword.length === 0 && historyKeywords.length > 0) {
    return (
      <SuggestWrapper isFocus={isFocus} isEmpty={keyword.length === 0}>
        {historyKeywords.map(({ keyword: suggest, id }, idx) => (
          <Link
            key={id}
            href={`/search?q=${suggest}`}
            style={{ background: referenceSelected === idx ? '#eee' : null }}
          >
            {suggest}
          </Link>
        ))}
      </SuggestWrapper>
    );
  }

  return (
    <SuggestWrapper isFocus={isFocus} isEmpty={keyword.length === 0}>
      {keyword.length > 0 &&
        Array.isArray(suggestKeywords) &&
        suggestKeywords.map((suggest, idx) => (
          <Link
            key={suggest}
            href={`/search?q=${suggest}`}
            onClick={() => addSearchHistory(suggest)}
            style={{
              background: referenceSelected === idx ? '#eee' : null,
              wordBreak: 'break-all',
            }}
          >
            {suggest}
          </Link>
        ))}
    </SuggestWrapper>
  );
};

export default SuggestList;
