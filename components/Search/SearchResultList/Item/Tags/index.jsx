import React, { useCallback } from "react";
import styled from "@emotion/styled";
import Link from "next/link";
import { useRouter } from "next/router";
import Chip from "@mui/material/Chip";
import { COLOR_TABLE } from "../../../../../constants/notion";

const TagsWrapper = styled.ul`
  display: flex;
  flex-wrap: wrap;
`;

// const TagItemWrapper = styled.li`
//   color: black;
//   border-radius: 15px;
//   padding: 2px 10px;
//   margin: 0 5px;
//   white-space: nowrap;
//   cursor: pointer;
//   ${({ color }) => css`
//     background-color: ${COLOR_TABLE[color ?? "default"]};
//   `}
// `;

const Tags = ({ tags, queryTags }) => {
  const { query } = useRouter();
  const linkTagsHandler = useCallback(
    (newQuery) => {
      if (query.q) {
        return `/search?q=${query.q}&tags=${
          Array.isArray(queryTags) && queryTags.length > 0
            ? `${queryTags.join(",")},${newQuery}`
            : newQuery
        }`;
      }
      return `/search?tags=${
        Array.isArray(queryTags) && queryTags.length > 0
          ? `${queryTags.join(",")},${newQuery}`
          : newQuery
      }`;
    },
    [queryTags]
  );
  return (
    <TagsWrapper>
      {tags.map(({ name, color }) => (
        <Link key={name} href={linkTagsHandler(name)}>
          <li>
            <Chip
              label={name}
              sx={{
                backgroundColor: COLOR_TABLE[color ?? "default"],
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
          </li>
          {/* <TagItemWrapper color={color}>{name}</TagItemWrapper> */}
        </Link>
      ))}
    </TagsWrapper>
  );
};

export default Tags;
