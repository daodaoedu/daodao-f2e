import React, { useMemo } from "react";
import styled from "@emotion/styled";
import { useRouter } from "next/router";
import { Skeleton } from "@mui/material";
import { css } from "@emotion/react";
import { COLOR_TABLE } from "../../../../../constants/notion";

const TagsWrapper = styled.ul`
  display: flex;
  margin: 10px 0;
`;

const TagItemWrapper = styled.li`
  color: black;
  border-radius: 15px;
  padding: 2px 10px;
  margin: 0 5px;
  white-space: nowrap;
  ${({ color }) => css`
    background-color: ${COLOR_TABLE[color ?? "default"]};
  `}
`;

const Tags = ({ tags }) => {
  return (
    <TagsWrapper>
      {tags.map(({ name, color }) => (
        <TagItemWrapper key={name} color={color}>
          {name}
        </TagItemWrapper>
      ))}
    </TagsWrapper>
  );
};

export default Tags;
