import React, { useMemo } from "react";
import styled from "@emotion/styled";
import { css } from "@emotion/react";
import Link from "next/link";
import { Typography, Box } from "@mui/material";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
dayjs.extend(isBetween);

const LogoImageWrapper = styled(Box)`
  flex: 0 0 200px;
  width: 200px;
  height: 200px;
  position: relative;
  overflow: hidden;
  filter: drop-shadow(0px 1px 1px rgba(0, 0, 0, 0.25));
  cursor: pointer;
  &:hover: {
    transform: scale(1.05);
    transition: transform 0.4s;
  }
  @media (max-width: 767px) {
    flex: 0 0 100px;
    width: 100px;
    height: 100px;
  }
`;

const ImageWrapper = styled.div`
  width: 100%;
  height: 100%;
  background-color: #f5f5f5;
  ${({ image }) => css`
    background-image: ${`url(${image})`};
    background-size: cover;
    background-repeat: no-repeat;
    background-position: 50% 50%;
  `}
  border-radius: 20%;
  /* object-fit: cover; */
  /* opacity: 0; */

  @media (max-width: 767px) {
    border-radius: 10%;
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
    content: "近期資源";
    left: 20%;
  }

  ${({ isNewResource }) =>
    isNewResource &&
    css`
      position: absolute;
      top: 20px;
      right: -28px;
      height: 25px;
      width: 120px;
      background-color: #16b9b3;
      opacity: 0.9;
      color: #ffffffff;
      /* content: "近期資源"; */
      transform: rotate(45deg);
    `}

  @media (max-width: 767px) {
    width: 100px;
    height: 100px;
    &:after {
      position: absolute;
      color: #ffffffff;
      content: "近期";
      left: 30%;
    }
    ${({ isNewResource }) =>
      isNewResource &&
      css`
        position: absolute;
        top: 10px;
        right: -30px;
        height: 25px;
        width: 100px;
        background-color: #16b9b3;
        opacity: 0.9;
        color: #ffffffff;
        transform: rotate(45deg);
      `}
  }
`;

const LogoImage = ({ isNewResource, link, data }) => {
  return (
    <LogoImageWrapper>
      <ImageWrapper
        onClick={() => window.open(link, "_blank")}
        image={
          (Array.isArray(data?.properties["縮圖"]?.files) &&
            data.properties["縮圖"]?.files[0]?.name) ??
          "https://www.daoedu.tw/preview.webp"
        }
      />
      {isNewResource && <PromoteWrapper isNewResource={isNewResource} />}
    </LogoImageWrapper>
  );
};

export default LogoImage;
