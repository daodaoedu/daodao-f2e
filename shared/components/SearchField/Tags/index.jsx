import React from "react";
import styled from "@emotion/styled";

const TagsWrapper = styled.ul`
  display: flex;
  justify-content: center;
  align-items: center;
  li {
    margin: auto 10px;
  }
`;
const MOCK_TAGS = [{
  id: 0,
  text: '英語'
}, {
  id: 1,
  text: '程式設計'
}, {
  id: 2,
  text: '吉他'
}];

const SearchField = () => (
  <TagsWrapper>
    {MOCK_TAGS.map(({ text, id }) => (
      <li key={id}>
        {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
        <a href="#">
          #
          {' '}
          {text}
        </a>
      </li>
    ))}
  </TagsWrapper>
);

export default SearchField;
