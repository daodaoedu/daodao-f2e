import React from "react";
import Link from "next/link";
import styled from "@emotion/styled";
import { Chip } from "@mui/material";
import { useRouter } from "next/router";
import { COLOR_TABLE } from "../../../../constants/notion";

const TagsWrapper = styled.ul`
  display: flex;
  justify-content: center;
  align-items: center;
  /* li {
    margin: auto 10px;
    background-color: white;
    padding: 6px 12px;
    border-radius: 20px;

    a {
      color: #222222;
      font-weight: 500;
    }
  } */
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

const SearchField = () => {
  const router = useRouter();
  return (
    <TagsWrapper>
      {MOCK_TAGS.map(({ key, link, text }) => (
        <li key={key}>
          <Chip
            onClick={() => router.push(link)}
            label={text}
            value={text}
            sx={{
              backgroundColor:"#fff",
              opacity: "80%",
              cursor: "pointer",
              margin: "5px",
              whiteSpace: "nowrap",
              fontWeight: 500,
              fontSize: "16px",
              "&:hover": {
                opacity: "100%",
                backgroundColor: "#fff",
                transition: "transform 0.4s",
              },
            }}
          ></Chip>
        </li>
      ))}
    </TagsWrapper>
  );
};

export default SearchField;
