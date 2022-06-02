import React from "react";
import styled from "@emotion/styled";
import { Typography } from "@mui/material";

const IconListWrapper = styled.div`
  ul {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    margin-top: 15px;
  }
  li {
    cursor: pointer;
    margin: auto 10px;
  }
`;

const SubFooter = ({ title, list }) => {
  return (
    <IconListWrapper>
      <Typography
        variant="h2"
        sx={{
          marginBottom: "10px",
          fontSize: "18px",
          fontWeight: "500",
        }}
      >
        {title}
      </Typography>
      <ul>
        {list.map((value) => (
          <a
            key={value.alt}
            href={value.link}
            target="_blank"
            rel="noopener noreferrer"
          >
            <li>{value.icon}</li>
          </a>
        ))}
      </ul>
    </IconListWrapper>
  );
};

export default SubFooter;
