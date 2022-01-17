import React from "react";
import { css } from "@emotion/react";
import styled from "@emotion/styled";
import { useRouter } from "next/router";
import { SEARCH_TAGS } from "../../../../constants/category";
import Item from "./item";

const TagsWrapper = styled.ul`
  display: flex;
  justify-content: flex-start;
  align-items: center;
  margin: auto 5px;
  float: left;
  white-space: nowrap;
  overflow-x: scroll;

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

  @media (max-width: 767px) {
    z-index: -1;
    position: absolute;
    margin-top: 40px;
    top: 50%;
    left: 5px;
    justify-content: flex-start;
  }
`;

const Tags = ({ cats }) => {
  return (
    <TrendingWrapper>
      <TagsWrapper>
        {SEARCH_TAGS[cats].map((value) => (
          <Item key={`${value}`} title={value} />
        ))}
      </TagsWrapper>
    </TrendingWrapper>
  );
};

export default Tags;
