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
  overflow-x: scroll;
  flex-wrap: wrap;

  -ms-overflow-style: none; /* IE */
  scrollbar-width: none; /* Firefox */
  &::-webkit-scrollbar {
    display: none; /* Chrome, Safari, Edge and Opera */
  }
`;

const TrendingWrapper = styled.div`
  display: flex;
  justify-content: flex-start;
  align-items: center;

  /* @media (max-width: 767px) {
    z-index: -1;
    position: absolute;
    margin-top: 40px;
    top: 50%;
    left: 5px;
    justify-content: flex-start;
  } */
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
        marginTop: "20px",
      }}
    >
      <Whatshot sx={{ color: "red" }} />
      <TrendingWrapper>
        <TagsWrapper>
          {hotTags.map((value) => (
            <Item key={`${value}`} title={value} />
          ))}
        </TagsWrapper>
      </TrendingWrapper>
    </Box>
  );
};

export default Tags;
