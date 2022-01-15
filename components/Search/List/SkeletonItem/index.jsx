import React from "react";
import styled from "@emotion/styled";
import { useRouter } from "next/router";
import { Skeleton } from "@mui/material";

const ItemWrapper = styled.li`
  display: flex;
  /* justify-content: space-between;
  align-items: center; */
  margin: 10px 0;
`;
const ContentWrapper = styled.div`
  width: 100%;
  padding: 0 10px;
`;

const Item = () => {
  const router = useRouter();
  return (
    <ItemWrapper>
      <Skeleton variant="rectangular" width={100} height={100} />
      <ContentWrapper>
        <Skeleton variant="text" />
        <Skeleton variant="text" />
        <Skeleton variant="text" />
      </ContentWrapper>
    </ItemWrapper>
  );
};

export default Item;
