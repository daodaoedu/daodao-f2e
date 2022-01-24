import React from "react";
import styled from "@emotion/styled";
import Chip from "@mui/material/Chip";
import { COLOR_TABLE } from "../../../../constants/notion";

const ListWrapper = styled.ul`
  display: flex;
  flex-wrap: wrap;
  margin: 20px 0;
`;

const Tags = ({ tags, onDelete }) => {
  if (tags.length === 0) {
    return <></>;
  }
  return (
    <ListWrapper>
      {tags.map(({ key, value }) => (
        <Chip
          key={value}
          label={value}
          sx={{
            backgroundColor: COLOR_TABLE.default,
            cursor: "pointer",
            margin: "5px",
            whiteSpace: "nowrap",
            fontWeight: 500,
            fontSize: "14px",
            "&:hover": {
              opacity: "60%",
              transition: "transform 0.4s",
            },
          }}
          onClick={() => onDelete(key, value)}
          onDelete={() => onDelete(key, value)}
        />
      ))}
    </ListWrapper>
  );
};

export default Tags;
