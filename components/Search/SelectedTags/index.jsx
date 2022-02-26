import React, { useCallback } from "react";
import styled from "@emotion/styled";
// import Chip from "@mui/material/Chip";
import { useRouter } from "next/router";
// import { COLOR_TABLE } from "../../../constants/notion";
import Tags from "./Tags";
import { LocalOffer } from "@mui/icons-material";
const ListWrapper = styled.ul`
  display: flex;
  justify-content: flex-start;
  align-items: center;
  flex-wrap: wrap;
`;

const SelectedTags = () => {
  const { push, query } = useRouter();

  const tags = (query?.tags ?? "")
    .split(",")
    .map((tag) => ({ key: "tags", value: tag }))
    .filter(({ value }) => value !== "");

  const feeTags = (query?.fee ?? "")
    .split(",")
    .map((tag) => ({ key: "fee", value: tag }))
    .filter(({ value }) => value !== "");

  const ageTags = (query?.ages ?? "")
    .split(",")
    .map((tag) => ({ key: "ages", value: tag }))
    .filter(({ value }) => value !== "");

  const onDelete = useCallback(
    (key, targetValue) => {
      if (typeof query[key] === "string" && query[key].split(",").length > 1) {
        push({
          pathname: "/search",
          query: {
            ...query,
            [key]: query[key]
              .split(",")
              .filter((value) => value !== targetValue)
              .join(","),
          },
        });
      } else {
        delete query[key];
        push({
          pathname: "/search",
          query,
        });
      }
    },
    [push, query]
  );

  return (
    <ListWrapper>
      <LocalOffer
        sx={{
          fontSize: "22px",
          color: "rgb(72, 175, 226)",
          marginRight: "6px",
        }}
      />
      <Tags tags={tags} onDelete={onDelete} />
      <Tags tags={feeTags} onDelete={onDelete} />
      <Tags tags={ageTags} onDelete={onDelete} />
    </ListWrapper>
  );
};

export default SelectedTags;
