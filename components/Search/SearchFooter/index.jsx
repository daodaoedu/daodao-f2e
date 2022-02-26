import React from "react";
import styled from "@emotion/styled";
import { Box } from "@mui/material";
// import Lottie from "react-lottie-player";
const LoadMore = styled.div`
  position: absolute;
  bottom: 100px;
  height: 100px;
  width: 100%;
`;

const SearchFooter = ({
  hasMoredata,
  loadMoreButtonRef,
  isError,
  errorMessage,
  isLoading,
  isLoadingNextData,
}) => {
  if (hasMoredata) {
    return <LoadMore ref={loadMoreButtonRef} />;
  }
  if (!isLoading && !isLoadingNextData && !hasMoredata && !isError) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          marginBottom: "60px",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/assets/nobody-land.gif"
          alt="nobody-land"
          width="300"
          height="300"
        />
        <Box
          sx={{
            fontSize: "18px",
            fontWeight: "500",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            lineHeight: "30px",
          }}
        >
          <Box sx={{ margin: "5px 0" }}>已經抵達無人島囉～</Box>
          <Box sx={{ margin: "5px 0" }}>
            試試其他搜尋條件，或是逛逛其他頁面呢？
          </Box>
        </Box>
      </Box>
    );
    //   <Box sx={{ margin: "20px" }}></Box>;
  }
  if (isError) {
    return <p>出問題囉：{errorMessage}</p>;
  }
  return <></>;
};

export default SearchFooter;
