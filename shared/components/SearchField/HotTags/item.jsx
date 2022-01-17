import React, { useCallback, useMemo } from "react";
import styled from "@emotion/styled";
import { useRouter } from "next/router";
import { Chip } from "@mui/material";
import { COLOR_TABLE } from "../../../../constants/notion";
import stringSanitizer from "../../../../utils/sanitizer";

const TagWrapper = styled(Chip)`
  margin: auto 5px;
  font-weight: 700;
  white-space: nowrap;
  a {
    color: #37b9eb;
    font-weight: bold;
    font-size: 16px;
  }

  a:hover {
    text-decoration: underline;
  }

  @media (max-width: 767px) {
    left: 70px;
    width: 85vw;
    overflow-x: visible;
    a {
      color: #007bbb;
      font-size: 14px;
    }
  }
`;
const Tag = ({ title }) => {
  const { push, query } = useRouter();
  const queryTags = useMemo(
    () =>
      typeof query.tags === "string"
        ? stringSanitizer(query.tags).split(",")
        : [],
    [query.tags]
  );
  const linkHandler = useCallback(
    (targetQuery) => {
      push(
        {
          pathname: "/search",
          query: {
            ...query,
            tags: [...new Set([...queryTags, targetQuery])].join(","),
          },
        },
        undefined,
        { shallow: true }
      );
    },
    [queryTags, query]
  );
  return (
    <Chip
      label={title}
      onClick={() => linkHandler(title)}
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
    />
  );
};

export default Tag;
