import React, { useCallback } from "react";
import styled from "@emotion/styled";
import Chip from "@mui/material/Chip";
import { useRouter } from "next/router";
import { COLOR_TABLE } from "../../../constants/notion";

const ListWrapper = styled.ul`
  display: flex;
  flex-wrap: wrap;
  margin: 20px 0;
`;

const SelectedTags = ({ queryTags }) => {
  const { push, query } = useRouter();
  const linkHandler = useCallback(
    (targetQuery) => {
      const filteredQuery = [...new Set([...query.tags.split(",")])].filter(
        (tag) => tag !== targetQuery
      );
      if (filteredQuery.length > 0) {
        push({
          pathname: "/search",
          query: {
            ...query,
            tags: filteredQuery.join(","),
          },
        });
      } else {
        delete query.tags;
        push({
          pathname: "/search",
          query,
        });
      }
    },
    [queryTags]
  );
  if (queryTags.length === 0) {
    return <></>;
  }
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
          onClick={() => linkHandler(tag)}
          onDelete={() => linkHandler(tag)}
        />
      ))}
    </ListWrapper>
  );
};

export default SelectedTags;
