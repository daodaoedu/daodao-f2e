import React from "react";
import styled from "@emotion/styled";
import { css } from "@emotion/react";
import { Paper, Box, Typography } from "@mui/material";
import dayjs from "dayjs";
import { getFirestore, collection } from "firebase/firestore";
import { useDocument, useCollection } from "react-firebase-hooks/firestore";
import { useRouter } from "next/router";
import Tags from "./Tags";
const ResourceCardWrapper = styled.div`
  /* border: 1px black solid;
  border-radius: 10px; */
  display: flex;
  justify-content: flex-start;
  align-items: flex-start;
`;

const ImageWrapper = styled.div`
  width: 100px;
  height: 100px;
  background-color: #f5f5f5;
  cursor: pointer;
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

const TitleWrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-start;
  align-items: center;
  .title {
    font-size: 20px;
    font-weight: 500;
    margin: 0 10px 0 0;
    color: black;
    &:hover {
      cursor: pointer;
      color: #37b9eb;
      transition: 0.5s;
    }
  }
  @media (max-width: 767px) {
    .title {
      text-overflow: ellipsis;
      width: 100%;
    }
  }
`;

const ResourceCard = ({ data }) => {
  const cats = data["領域名稱"];
  const resourceName = data["資源名稱"];
  const imageLink = data["縮圖"];
  const link = `/resource/${resourceName}`;
  //   const { push } = useRouter();
  return (
    <ResourceCardWrapper>
      <a target="_blank" href={link} rel="noopener noreferrer">
        <ImageWrapper image={imageLink} />
      </a>
      <Box
        sx={{
          marginLeft: "20px",
          //   display: "flex",
          //   flexDirection: "column",
          //   justifyContent: "space-between",
        }}
      >
        <TitleWrapper>
          <a target="_blank" href={link} rel="noopener noreferrer">
            <h2 className="title">{resourceName ?? "未命名"}</h2>
          </a>
        </TitleWrapper>
        <Tags type="cats" tags={cats} />
      </Box>
    </ResourceCardWrapper>
  );
};

export default ResourceCard;
