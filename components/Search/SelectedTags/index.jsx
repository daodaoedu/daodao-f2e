import React, { useCallback } from "react";
import styled from "@emotion/styled";
import Chip from "@mui/material/Chip";
import { useRouter } from "next/router";
import { COLOR_TABLE } from "../../../constants/notion";

// import Item from "./Item";
// import SkeletonItem from "./SkeletonItem";

const ListWrapper = styled.ul`
  display: flex;
  flex-wrap: wrap;
`;

const SelectedTags = ({ queryTags }) => {
  const { push, query } = useRouter();
  const linkHandler = useCallback(
    (targetQuery) => {
      const filteredQuery = queryTags.filter((s) => s !== targetQuery);
      if (typeof query.q === "string" && query.q.length > 0) {
        if (filteredQuery.length === 0) {
          return `/search?q=${query.q}`;
        }
        return `/search?q=${query.q}&tags=${filteredQuery.join(",")}`;
      }
      if (filteredQuery.length === 0) {
        return `/search`;
      }
      return `/search?tags=${filteredQuery.join(",")}`;
    },
    [queryTags]
  );
  return (
    <ListWrapper>
      {queryTags.map((tag) => (
        <Chip
          label={tag}
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
          onDelete={() => push(linkHandler(tag))}
        />
      ))}
    </ListWrapper>
  );
};

export default SelectedTags;
