import React from "react";
import styled from "@emotion/styled";
import { Skeleton } from "@mui/material";

const ItemWrapper = styled.li`
  display: flex;
  /* justify-content: space-between;
  align-items: center; */
  margin: 10px 0;
  padding-bottom: 20px;
  border-bottom: 1px solid rgba(168, 168, 168, 0.3);
`;
const ContentWrapper = styled.div`
  width: calc(100% - 100px);
  padding: 0 10px;
`;

const SkeletonImageWrapper = styled(Skeleton)`
  width: calc(100% - 200px);
  padding: 0 10px;
  width: 200px;
  height: 200px;
  @media (max-width: 767px) {
    width: 100px;
    height: 100px;
  }
`;

const SkeletonItem = () => {
  return (
    <ItemWrapper>
      <SkeletonImageWrapper variant="rectangular" />
      <ContentWrapper>
        <Skeleton variant="text" />
        <Skeleton variant="text" />
        <Skeleton variant="text" />
      </ContentWrapper>
    </ItemWrapper>
  );
};

export default SkeletonItem;
