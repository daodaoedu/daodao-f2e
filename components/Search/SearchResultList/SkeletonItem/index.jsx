import React from "react";
import styled from "@emotion/styled";
import { Skeleton, Box } from "@mui/material";

const ItemWrapper = styled.li`
  display: flex;
  padding: 20px 0;
  border-bottom: 1px solid rgba(168, 168, 168, 0.3);
`;
const ContentWrapper = styled.div`
  width: calc(100% - 100px);
  margin-left: 20px;
  margin-right: 20px;
  padding: 0 10px;
`;

const SkeletonImageWrapper = styled(Skeleton)`
  padding: 0 10px;
  width: 200px;
  height: 200px;
  flex: 0 0 200px;
  border-radius: 20%;
  @media (max-width: 767px) {
    width: 100px;
    height: 100px;
    flex: 0 0 100px;
  }
`;

const SkeletonItem = () => {
  return (
    <ItemWrapper>
      <SkeletonImageWrapper variant="rectangular" />
      <ContentWrapper>
        <Skeleton variant="text" sx={{ fontSize: "32px", maxWidth: "300px", width: "100%" }} />
        <Box
          sx={{
            display: "flex",
            justifyContent: "flex-start",
            alignItems: "center",
          }}
        >
          <Skeleton
            variant="rectangular"
            sx={{
              height: "32px",
              width: "60px",
              borderRadius: "20px",
              margin: "5px",
            }}
          />
          <Skeleton
            variant="rectangular"
            sx={{
              height: "32px",
              width: "80px",
              borderRadius: "20px",
              margin: "5px",
            }}
          />
          <Skeleton
            variant="rectangular"
            sx={{
              height: "32px",
              width: "70px",
              borderRadius: "20px",
              margin: "5px",
            }}
          />
        </Box>
        <Box>
          <Skeleton
            variant="text"
            sx={{
              fontSize: "24px",
            }}
          />
          <Skeleton
            variant="text"
            sx={{
              fontSize: "24px",
            }}
          />
        </Box>
      </ContentWrapper>
    </ItemWrapper>
  );
};

export default SkeletonItem;
