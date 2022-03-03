import React, { useMemo } from "react";
import styled from "@emotion/styled";
import { css } from "@emotion/react";
import Link from "next/link";
import { Typography, Box } from "@mui/material";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";

const Contributors = ({ contributors }) => {
  return (
    <Box sx={{ margin: "5px" }}>
      <Typography
        sx={{
          fontWeight: "500",
        }}
      >
        資源貢獻者：
      </Typography>
      {contributors.map((contributor) => (
        <Typography key={contributor.name} sx={{ margin: "0 5px" }}>
          {contributor.name}
        </Typography>
      ))}
      <Link href="/contribute/resource" passHref>
        <Typography
          sx={{
            color: "blue",
            fontSize: "12px",
            cursor: "pointer",
            fontWeight: "500",
            margin: "0 5px",
          }}
        >
          如何成為貢獻者？
        </Typography>
      </Link>
    </Box>
  );
};

export default Contributors;
