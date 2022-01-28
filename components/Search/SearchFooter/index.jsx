import React from "react";
import styled from "@emotion/styled";
import { Box } from "@mui/material";

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
}) => {
  console.log("hasMoredata", hasMoredata);
  if (!hasMoredata && !isError) {
    <Box sx={{ margin: "20px" }}>已經抵達無人島囉～</Box>;
  }
  if (hasMoredata) {
    <LoadMore ref={loadMoreButtonRef} />;
  }
  if (isError) {
    <p>出問題囉：{errorMessage}</p>;
  }
  return <></>;
};

export default SearchFooter;
