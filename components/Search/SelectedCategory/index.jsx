import React, { useCallback } from "react";
import styled from "@emotion/styled";
import Chip from "@mui/material/Chip";
import { useRouter } from "next/router";
import { COLOR_TABLE } from "../../../constants/notion";
import { CATEGORIES } from "../../../constants/category";
const ListWrapper = styled.ul`
  display: flex;
  margin: 20px 0;
  /* flex-wrap: wrap; */
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
  // const onClickCategory = useCallback(
  //   (event) => {
  //     const targetQuery = event.target.textContent;
  //     const isSelected = (query?.cats ?? "").includes(targetQuery);
  //     const result = (query?.cats ?? "")
  //       .split(",")
  //       .filter((val) => val !== targetQuery)
  //       .filter((val) => val !== "");
  //     if (isSelected) {
  //       // 取消選取可能會清空
  //       if (result.length > 0) {
  //         push({
  //           pathname: "/search",
  //           query: {
  //             ...query,
  //             cats: result.join(","),
  //           },
  //         });
  //       } else {
  //         delete query.cats;
  //         push({
  //           pathname: "/search",
  //           query,
  //         });
  //       }
  //     } else if (result.length > 0) {
  //       push({
  //         pathname: "/search",
  //         query: {
  //           ...query,
  //           cats: [
  //             ...new Set(
  //               (query?.cats ?? "").split(",").length > 0
  //                 ? [...(query?.cats ?? "").split(","), targetQuery]
  //                 : [targetQuery]
  //             ),
  //           ].join(","),
  //         },
  //       });
  //     } else {
  //       push({
  //         pathname: "/search",
  //         query: {
  //           ...query,
  //           cats: targetQuery,
  //         },
  //       });
  //     }
  //   },
  //   [push, query]
  // );

  return (
    <ListWrapper>
      {CATEGORIES.map(({ key, value }) => (
        <Chip
          key={key}
          label={value}
          value={value}
          onClick={onClickCategory}
          sx={{
            backgroundColor:
              (query?.cats ?? "").includes(value) || isCurrentSelectAllCats
                ? COLOR_TABLE.green
                : COLOR_TABLE.default,
            opacity:
              (query?.cats ?? "").includes(value) || isCurrentSelectAllCats
                ? "100%"
                : "40%",
            cursor: "pointer",
            margin: "5px",
            whiteSpace: "nowrap",
            fontWeight: 500,
            fontSize: "16px",
            "&:hover": {
              opacity: "100%",
              transition: "all 0.5s ease",
              backgroundColor: COLOR_TABLE.green,
            },
          }}
        />
      ))}
    </ListWrapper>
  );
};

export default SelectedCategory;
