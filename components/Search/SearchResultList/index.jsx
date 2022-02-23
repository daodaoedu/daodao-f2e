import React from "react";
import styled from "@emotion/styled";
import Item from "./Item";
import SkeletonItem from "./SkeletonItem";

const ListWrapper = styled.ul`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`;

const List = ({ list, queryTags, isLoading, isLoadingNextData }) => {
  if (isLoading) {
    return (
      <ListWrapper>
        <SkeletonItem />
        <SkeletonItem />
        <SkeletonItem />
        <SkeletonItem />
        <SkeletonItem />
      </ListWrapper>
    );
  }
  return (
    <ListWrapper>
      {list.map((item) => (
        <Item
          key={item.properties["資源名稱"].title[0].plain_text}
          data={item}
          queryTags={queryTags}
        />
      ))}
      {isLoadingNextData && (
        <>
          <SkeletonItem />
          <SkeletonItem />
          <SkeletonItem />
        </>
      )}
    </ListWrapper>
  );
};

export default List;
