import React from "react";
import Link from "next/link";
import styled from "@emotion/styled";

const TagsWrapper = styled.ul`
  display: flex;
  justify-content: center;
  align-items: center;
  li {
    margin: auto 10px;
    background-color: white;
    padding: 6px 12px;
    border-radius: 20px;

    a {
      color: #222222;
      font-weight: 500;
    }
  }
`;
const MOCK_TAGS = [
  {
    key: "英語",
    link: "/search?tags=英語&cats=語言與文學",
    text: "英語",
  },
  {
    key: "邏輯",
    link: "/search?tags=邏輯&cats=數學與邏輯",
    text: "邏輯",
  },
  {
    key: "數學",
    link: "/search?tags=數學&cats=數學與邏輯",
    text: "數學",
  },
];

const SearchField = () => (
  <TagsWrapper>
    {MOCK_TAGS.map(({ key, link, text }) => (
      <li key={key}>
        {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
        <Link href={link}>{text}</Link>
      </li>
    ))}
  </TagsWrapper>
);

export default SearchField;
