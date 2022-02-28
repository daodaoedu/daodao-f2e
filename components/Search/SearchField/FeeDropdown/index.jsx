import React, { useState } from "react";
import styled from "@emotion/styled";
import { Box, Select, MenuItem } from "@mui/material";
import { useRouter } from "next/router";
// import { SEARCH_TAGS } from "../../../constants/category";
import OutlinedInput from "@mui/material/OutlinedInput";
import InputLabel from "@mui/material/InputLabel";
import FormControl from "@mui/material/FormControl";
import Chip from "@mui/material/Chip";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormLabel from "@mui/material/FormLabel";

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

const names = ["不拘", "免費", "部分免費", "需付費"];

const FeeDropdown = () => {
  const { query, push } = useRouter();
  const fee = query?.fee ? (query?.fee).split(",") : [];
  const handleChange = (event) => {
    const {
      target: { value },
    } = event;

    if (value === names[0]) {
      delete query.fee;
      push({
        pathname: "/search",
        query,
      });
    } else {
      push({
        pathname: "/search",
        query: {
          ...query,
          fee: value,
        },
      });
    }
  };
  return (
    <FormControl sx={{ m: 1, marginLeft: "20px" }}>
      <FormLabel>費用</FormLabel>
      <RadioGroup
        row
        aria-labelledby="demo-row-radio-buttons-group-label"
        name="row-radio-buttons-group"
        onChange={handleChange}
        value={query?.fee ? fee : "不拘"}
      >
        {names.map((name) => (
          <FormControlLabel
            key={name}
            value={name}
            label={name}
            control={<Radio />}
          />
        ))}
      </RadioGroup>
      {/* <Select
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
        sx={{
          borderRadius: "20px",
          width: 150,
        }}
      >
        {names.map((name) => (
          <MenuItem key={name} value={name}>
            {name}
          </MenuItem>
        ))}
      </Select> */}
    </FormControl>
  );
};

export default FeeDropdown;
