import React, { useCallback, useEffect, useRef, useState } from "react";
import styled from "@emotion/styled";
import Chip from "@mui/material/Chip";
import router, { useRouter } from "next/router";
import { COLOR_TABLE } from "../../../constants/notion";
import { CATEGORIES } from "../../../constants/category";
import CatChip from "./CatChip";
import ScrollButton from '../../../shared/components/ScrollButton';
import { Box } from "@mui/material";
// import { TikTokFont } from "../../../shared/styles/css";

const ListWrapper = styled.ul`
  display: flex;
  margin: 20px 0;
  max-width: calc(100vw - 49px);
  overflow-x: scroll;
  -ms-overflow-style: none; /* IE */
  scrollbar-width: none; /* Firefox */
  scroll-behavior: smooth;
  &::-webkit-scrollbar {
    display: none; /* Chrome, Safari, Edge and Opera */
  }

  /* ${TikTokFont} */

  @media (max-width: 767px) {
    margin: 10px 0;
  }
`;



const SelectedCategory = () => {
  const [isShowLeftScrollButton, setIsShowLeftScrollButton] = useState(false);
  const [isShowRightScrollButton, setIsShowRightScrollButton] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (ref?.current?.scrollLeft === 0) {
      setIsShowLeftScrollButton(false);
    }
    if (ref?.current?.scrollWidth <= ref?.current?.clientWidth) {
      setIsShowRightScrollButton(false);
    }
  }, [ref?.current?.scrollWidth, ref?.current?.clientWidth]);

  const { push, query } = useRouter();
  const isCurrentSelectAllCats = !query?.cats;
  // 單選類別
  const onClickCategory = useCallback(
    (event) => {
      const targetCatName = event.target.textContent;
      const currentQueries = (query?.cats ?? "")
        .split(",")
        .filter((name) => name !== "");
      const isRemove = currentQueries.includes(targetCatName);
      if (isRemove) {
        // 只剩一個直接刪除
        delete query.cats;
        push({
          pathname: "/search",
          query,
        });
      } else {
        push({
          pathname: "/search",
          query: {
            ...query,
            cats: targetCatName,
          },
        });
      }
    },
    [push, query]
  );

  return (
    <Box sx={{ position: "relative" }}>
      <ScrollButton
        type="left"
        isShowScrollButton={isShowLeftScrollButton}
        onScrollEvent={() =>
          (ref.current.scrollLeft -= ref.current.offsetWidth + 100)
        }
      />
      <ListWrapper
        ref={ref}
        onScroll={(e) => {
          const isStartOfList = e.target.scrollLeft === 0;
          const isEndOfList =
            ((e.target.scrollWidth - e.target.scrollLeft) - e.target.offsetWidth) <= 5;
          if (isStartOfList) {
            setIsShowLeftScrollButton(() => false);
          } else {
            setIsShowLeftScrollButton(() => true);
          }

          if (isEndOfList) {
            setIsShowRightScrollButton(() => false);
          } else {
            setIsShowRightScrollButton(() => true);
          }
        }}
      >
        <Chip
          label={"全部"}
          value={"全部"}
          onClick={() => {
            delete query.cats;
            push({
              pathname: "/search",
              query,
            });
          }}
          sx={{
            backgroundColor:
              (query?.cats ?? "") === ""
                ? COLOR_TABLE.green
                : COLOR_TABLE.default,
            opacity: (query?.cats ?? "") === "" ? "100%" : "40%",
            cursor: "pointer",
            margin: "5px",
            whiteSpace: "nowrap",
            fontWeight: 500,
            fontSize: "16px",
            "&:hover": {
              backgroundColor: COLOR_TABLE.green,
            },
          }}
        />
        {CATEGORIES.map(({ key, value }) => (
          <CatChip
            key={key}
            value={value}
            onClickCategory={onClickCategory}
            isCurrentSelectAllCats={isCurrentSelectAllCats}
          />
        ))}
      </ListWrapper>
      <ScrollButton
        type="right"
        isShowScrollButton={isShowRightScrollButton}
        onScrollEvent={() =>
          (ref.current.scrollLeft += ref.current.offsetWidth + 100)
        }
      />
    </Box>
  );
};

export default SelectedCategory;
