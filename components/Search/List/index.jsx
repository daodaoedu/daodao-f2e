import React, { useMemo } from "react";
import styled from "@emotion/styled";
import Item from "./Item";
import SkeletonItem from "./SkeletonItem";

const ListWrapper = styled.ul`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`;

const List = ({ list, isLoading }) => {
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
        <Item key={item?.id} data={item} />
      ))}
    </ListWrapper>
  );
};

export default List;
