import React, { useMemo } from "react";
import styled from "@emotion/styled";
import { useRouter } from "next/router";
import { Paper } from "@mui/material";
import useSWRImmutable from "swr/immutable";
import Tags from "./Tags";
import { postFetcher } from "../../utils/fetcher";
import { css } from "@emotion/react";

const ResourceWrapper = styled.section`
  padding-top: 40px;
  padding-bottom: 40px;
  .title {
    font-size: 24px;
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
const ImageWrapper = styled.div`
  width: 200px;
  height: 200px;
  margin: 10px;
  background-color: #f5f5f5;
  filter: drop-shadow(0px 1px 1px rgba(0, 0, 0, 0.25));
  ${({ image }) => css`
    background-image: ${`url(${image})`};
    background-size: cover;
    background-repeat: no-repeat;
    background-position: 50% 50%;
  `}
  border-radius: 20px;
  /* opacity: 0; */

  cursor: pointer;
  /* object-fit: cover; */
  &:hover {
    transform: scale(1.05);
    transition: transform 0.4s;
  }
  @media (max-width: 767px) {
    width: 100px;
    height: 100px;
  }
`;

const Resource = ({ data }) => {
  const isLoading = useMemo(() => !data, [data]);
  const title = useMemo(
    () =>
      data?.properties && data?.properties["資源名稱"]
        ? data?.properties["資源名稱"]?.title[0]?.plain_text
        : "",
    [data?.properties]
  );
  const desc = useMemo(
    () =>
      data?.properties && data?.properties["介紹"]
        ? data.properties["介紹"]?.rich_text[0]?.plain_text
        : "",
    [data?.properties]
  );
  const image = useMemo(
    () =>
      data?.properties && data?.properties["縮圖"]
        ? data.properties["縮圖"]?.files[0]?.external?.url
        : "",
    [data?.properties]
  );
  const link = useMemo(
    () =>
      data?.properties && data?.properties["連結"]
        ? data?.properties["連結"]?.url
        : "",
    [data?.properties]
  );
  const tags = useMemo(
    () =>
      data?.properties && data?.properties["標籤"]
        ? data?.properties["標籤"]?.multi_select
        : [],
    [data?.properties]
  );
  // console.log("tags", tags);

  if (isLoading) {
    return <ResourceWrapper />;
  }
  return (
    <ResourceWrapper>
      <Paper
        sx={{
          width: "80%",
          margin: "0 auto",
          padding: "10px",
          "& > .title": {
            fontSize: "20px",
            fontWeight: "bold",
            margin: "10px 0",
            cursor: "pointer",
          },
          "& > .desc": {
            fontSize: "18px",
            // fontWeight: "500",
            margin: "10px 0",
          },
        }}
      >
        <a target="_blank" href={link} rel="noopener noreferrer">
          <h1 className="title">{title} 的資源介紹</h1>
        </a>
        {/* <Image src={image} alt="image" layout="fill" /> */}
        <ImageWrapper
          onClick={() => window.open(link, "_blank")}
          image={image ?? "/preview.webp"}
        />
        <Tags tags={tags} />
        <p className="desc">{desc}</p>
      </Paper>
    </ResourceWrapper>
  );
};

export default Resource;
