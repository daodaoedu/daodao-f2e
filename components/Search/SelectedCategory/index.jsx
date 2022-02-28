import React, { useCallback } from "react";
import styled from "@emotion/styled";
import Chip from "@mui/material/Chip";
import { useRouter } from "next/router";
import { COLOR_TABLE } from "../../../constants/notion";
import { CATEGORIES } from "../../../constants/category";
import CatChip from "./CatChip";
const ListWrapper = styled.ul`
  display: flex;
  margin: 20px 0;
  max-width: calc(100vw - 49px);
  overflow-x: scroll;
  -ms-overflow-style: none; /* IE */
  scrollbar-width: none; /* Firefox */
  &::-webkit-scrollbar {
    display: none; /* Chrome, Safari, Edge and Opera */
  }
  @media (max-width: 767px) {
    margin: 10px 0;
  }
`;

const SelectedCategory = () => {
  const { push, query } = useRouter();
  const isCurrentSelectAllCats = !query?.cats;
  const onClickCategory = useCallback(
    (event) => {
      const currentQueries = (query?.cats ?? "")
        .split(",")
        .filter((name) => name !== "");
      const targetCatName = event.target.textContent;
      const isRemove = currentQueries.includes(targetCatName);
      if (isRemove) {
        if (currentQueries.length > 1) {
          push({
            pathname: "/search",
            query: {
              ...query,
              cats: currentQueries
                .filter((name) => name !== targetCatName)
                .join(","),
            },
          });
        } else {
          // 只剩一個直接刪除
          delete query.cats;
          push({
            pathname: "/search",
            query,
          });
        }
      } else {
        push({
          pathname: "/search",
          query: {
            ...query,
            cats: [...currentQueries, targetCatName].join(","),
          },
        });
      }
    },
    [push, query]
  );

  return (
    <ListWrapper>
      {CATEGORIES.map(({ key, value }) => (
        <CatChip
          key={key}
          value={value}
          onClickCategory={onClickCategory}
          isCurrentSelectAllCats={isCurrentSelectAllCats}
        />
      ))}
    </ListWrapper>
  );
};

export default SelectedCategory;
