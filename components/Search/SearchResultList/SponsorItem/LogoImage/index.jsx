import React, { useMemo } from "react";
import styled from "@emotion/styled";
import { css } from "@emotion/react";
import Link from "next/link";
import { Typography, Box } from "@mui/material";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import { COLOR_TABLE } from "../../../../../constants/notion";
dayjs.extend(isBetween);

const ImageWrapper = styled.div`
  width: 200px;
  height: 200px;
  background-color: #f5f5f5;
  ${({ image }) => css`
    background-image: ${`url(${image})`};
    background-size: cover;
    background-repeat: no-repeat;
    background-position: 50% 50%;
  `}
  border-radius: 20px;
  /* object-fit: cover; */
  /* opacity: 0; */

  @media (max-width: 767px) {
    width: 100px;
    height: 100px;
  }
`;

const PromoteWrapper = styled.div`
  & > p {
    text-align: center;
    font-weight: bold;
  }

  &:after {
    position: absolute;
    color: #ffffffff;
    content: "合作夥伴";
    left: 20%;
  }

  position: absolute;
  top: 20px;
  right: -28px;
  height: 25px;
  width: 120px;
  background-color: red;
  opacity: 0.9;
  color: #ffffffff;
  font-weight: bold;
  /* content: "近期資源"; */
  transform: rotate(45deg);

  @media (max-width: 767px) {
    width: 100px;
    height: 100px;
    &:after {
      position: absolute;
      color: #ffffffff;
      content: "近期";
      left: 30%;
    }
    position: absolute;
    top: 10px;
    right: -30px;
    height: 25px;
    width: 100px;
    background-color: red;
    opacity: 0.9;
    color: #ffffffff;
    font-weight: bold;
    transform: rotate(45deg);
`;

const LogoImage = ({ link, data }) => {
  return (
    <Box
      sx={{
        position: "relative",
        overflow: "hidden",
        filter: "drop-shadow(0px 1px 1px rgba(0, 0, 0, 0.25))",
        cursor: "pointer",
        "&:hover": {
          transform: "scale(1.05)",
          transition: "transform 0.4s",
        },
      }}
    >
      <ImageWrapper
        onClick={() => window.open(link, "_blank")}
        image={
          (Array.isArray(data?.properties["縮圖"]?.files) &&
            data.properties["縮圖"]?.files[0]?.name) ??
          "https://www.daoedu.tw/preview.webp"
        }
      />
      <PromoteWrapper />
    </Box>
  );
};

export default LogoImage;
