import React from "react";
import styled from "@emotion/styled";
import { SEARCH_TAGS } from "../../../../constants/category";
import Item from "./item";
import { Whatshot } from "@mui/icons-material";
import { Box } from "@mui/material";

const TagsWrapper = styled.ul`
  display: flex;
  justify-content: flex-start;
  align-items: center;
  margin: auto 5px;
  white-space: nowrap;
  max-width: calc(100vw - 49px);
  overflow-x: scroll;
  -ms-overflow-style: none; /* IE */
  scrollbar-width: none; /* Firefox */
  &::-webkit-scrollbar {
    display: none; /* Chrome, Safari, Edge and Opera */
  }
`;

const Tags = ({ queryList }) => {
  const lastSelectedCat = queryList.length > 0 && queryList[0];
  const hotTags =
    Array.isArray(queryList) && queryList.length > 0 && lastSelectedCat
      ? SEARCH_TAGS[lastSelectedCat]
      : SEARCH_TAGS["語言與文學"];
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "row",
        justifyContent: "flex-start",
        alignItems: "center",
        marginTop: "10px",
      }}
    >
      <Whatshot sx={{ color: "red" }} />
      <TagsWrapper>
        {hotTags.map((value) => (
          <Item key={`${value}`} title={value} />
        ))}
      </TagsWrapper>
    </Box>
  );
};

export default Tags;
