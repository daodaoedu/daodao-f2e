import React from "react";
import styled from "@emotion/styled";
import { Skeleton } from "@mui/material";

const ItemWrapper = styled.li`
  display: flex;
  /* justify-content: space-between;
  align-items: center; */
  margin: 10px 0;
`;
const ContentWrapper = styled.div`
  width: calc(100% - 200px);
  padding: 0 10px;
`;

const Item = () => {
  return (
    <ItemWrapper>
      <Skeleton variant="rectangular" width={200} height={200} />
      <ContentWrapper>
        <Skeleton variant="text" />
        <Skeleton variant="text" />
        <Skeleton variant="text" />
      </ContentWrapper>
    </ItemWrapper>
  );
};

export default Item;
