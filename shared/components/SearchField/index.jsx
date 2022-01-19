import React from "react";
import styled from "@emotion/styled";
import { Box } from "@mui/material";
import { useRouter } from "next/router";
import { Whatshot } from "@mui/icons-material";
import HotTags from "./HotTags";
import SearchInput from "./Input";

const SearchFieldWrapper = styled.div`
  width: 80%;

  @media (max-width: 767px) {
    width: 100%;
  }

  /* @media (max-width: 767px) {
    margin: 0 10px 10px 10px;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    width: 100%;
  } */
`;
const TYPE = [
  "language",
  "math",
  "comsci",
  "natusci",
  "humanity",
  "art",
  "education",
  "life",
  "health",
  "business",
  "multires",
];

const SearchField = () => {
  const { query } = useRouter();
  return (
    <SearchFieldWrapper>
      <SearchInput />
      {TYPE.includes(query.cats) && (
        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "flex-start",
            alignItems: "center",
            marginTop: "20px",
          }}
        >
          {/* <p>熱門：</p> */}
          <Whatshot sx={{ color: "red" }} />
          <HotTags cats={query.cats} />
        </Box>
      )}
    </SearchFieldWrapper>
  );
};

export default SearchField;
