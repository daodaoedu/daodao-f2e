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

const names = ["學齡前", "國小", "國高中", "大學以上"];

const AgeDropdown = () => {
  const { query, push } = useRouter();
  const ages = query?.ages ? (query?.ages).split(",") : [];
  const handleChange = (event) => {
    const {
      target: { value },
    } = event;

    if (value.length > 0) {
      push({
        pathname: "/search",
        query: {
          ...query,
          ages: value.join(","),
        },
      });
    } else {
      delete query.ages;
      push({
        pathname: "/search",
        query,
      });
    }
  };
  return (
    <FormControl sx={{ m: 1, minWidth: 150 }}>
      <InputLabel id="demo-multiple-chip-label">年齡層</InputLabel>
      <Select
        multiple
        autoWidth
        value={ages}
        onChange={handleChange}
        input={<OutlinedInput id="select-multiple-chip" label="Chip" />}
        renderValue={(selected) =>
          selected.length > 0 && (
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
              {selected.map((value) => (
                <Chip key={value} label={value} />
              ))}
            </Box>
          )
        }
        MenuProps={MenuProps}
        sx={{
          borderRadius: "20px",
        }}
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

export default AgeDropdown;
