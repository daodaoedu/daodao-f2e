import React, { useState } from "react";
import styled from "@emotion/styled";
import { Box, Select, MenuItem } from "@mui/material";
import { useRouter } from "next/router";
import { Whatshot } from "@mui/icons-material";
import HotTags from "./HotTags";
import SearchInput from "./SearchInput";
import { SEARCH_TAGS } from "../../../constants/category";
import OutlinedInput from "@mui/material/OutlinedInput";
import InputLabel from "@mui/material/InputLabel";
import FormControl from "@mui/material/FormControl";
import Chip from "@mui/material/Chip";
import AgeDropdown from "./AgeDropdown";
import FeeDropdown from "./FeeDropdown";
import AgeCheckbox from "./AgeCheckbox";

const SearchFieldWrapper = styled.div`
  width: 100%;

  /* @media (max-width: 767px) {
    margin: 0 10px 10px 10px;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    width: 100%;
  } */
`;

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

const names = ["學齡前", "國小", "國高中", "大學以上"];

const SearchField = () => {
  const { query } = useRouter();
  const queryList = (query?.cats ?? "").split(",").reverse();
  return (
    <SearchFieldWrapper>
      <SearchInput />
      <HotTags queryList={queryList} />
      <Box
        sx={{
          margin: "5px 0",
          display: "flex",
          justifyContent: "flex-start",
          alignItems: "center",
          "@media (max-width: 767px)": {
            margin: "10px 0",
            flexDirection: "column",
            alignItems: "flex-start",
          },
        }}
      >
        {/* <AgeDropdown /> */}
        <AgeCheckbox />
        <FeeDropdown />
      </Box>
    </SearchFieldWrapper>
  );
};

export default SearchField;
