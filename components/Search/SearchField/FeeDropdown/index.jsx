import React, { useState } from "react";
import styled from "@emotion/styled";
import { Box, Select, MenuItem } from "@mui/material";
import { useRouter } from "next/router";
// import { SEARCH_TAGS } from "../../../constants/category";
import OutlinedInput from "@mui/material/OutlinedInput";
import InputLabel from "@mui/material/InputLabel";
import FormControl from "@mui/material/FormControl";
import Chip from "@mui/material/Chip";

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

const names = ["免費", "部分免費"];

const FeeDropdown = () => {
  const { query, push } = useRouter();
  const fee = query?.fee ? (query?.fee).split(",") : [];
  const handleChange = (event) => {
    const {
      target: { value },
    } = event;
    if (value.length > 0) {
      push({
        pathname: "/search",
        query: {
          ...query,
          fee: value.join(","),
        },
      });
    } else {
      delete query.fee;
      push({
        pathname: "/search",
        query,
      });
    }
  };
  return (
    <FormControl sx={{ m: 1, width: 300 }}>
      <InputLabel id="demo-multiple-chip-label">費用</InputLabel>
      <Select
        multiple
        value={fee}
        onChange={handleChange}
        input={<OutlinedInput id="select-multiple-chip" label="Chip" />}
        renderValue={(selected) => (
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
            {selected.map((value) => (
              <Chip key={value} label={value} />
            ))}
          </Box>
        )}
        MenuProps={MenuProps}
      >
        {names.map((name) => (
          <MenuItem key={name} value={name}>
            {name}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default FeeDropdown;
