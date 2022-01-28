import React from "react";
import styled from "@emotion/styled";
// import { Box } from "@mui/material";

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
  if (hasMoredata) {
    return <LoadMore ref={loadMoreButtonRef} />;
  }
  if (!hasMoredata && !isError) {
    return <p>已經抵達無人島囉～</p>;
    //   <Box sx={{ margin: "20px" }}></Box>;
  }
  if (isError) {
    return <p>出問題囉：{errorMessage}</p>;
  }
  return <></>;
};

export default SearchFooter;
