import React, { useEffect, useMemo, useState } from "react";
import styled from "@emotion/styled";
import { useRouter } from "next/router";
import { Button, Paper, Box, Stack } from "@mui/material";
import useSWRImmutable from "swr/immutable";
import Tags from "./Tags";
import { postFetcher } from "../../utils/fetcher";
import { css } from "@emotion/react";
import { DiscussionEmbed, Recommendations, CommentEmbed } from "disqus-react";
import { Share } from "@mui/icons-material";
import { CopyToClipboard } from "react-copy-to-clipboard";
import toast from "react-hot-toast";
import Shares from "./Shares";

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

const Resource = ({ data, title, desc, image }) => {
  const router = useRouter();
  const isLoading = useMemo(() => !data, [data]);
  const [disqusConfig, setDisqusConfig] = useState({});
  useEffect(() => {
    if (router.isReady) {
      setDisqusConfig({
        // url: `test-page.notion.dev.daoedu.tw${router.asPath}`,
        url: `https://test-page.notion.dev.daoedu.tw${router.asPath}`,
        identifier: encodeURIComponent(title),
        title: title,
        language: "zh_TW", //e.g. for Traditional Chinese (Taiwan)
      });
    }
  }, [router.asPath, router.isReady, title]);
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
  const resourcesTags = useMemo(
    () => data?.properties["資源類型"]?.multi_select ?? [],
    [data]
  );
  const ageOfUserTags = useMemo(
    () => data?.properties["年齡層"]?.multi_select ?? [],
    [data]
  );
  const feeTags = useMemo(
    () =>
      data?.properties["費用"]?.select
        ? [data?.properties["費用"]?.select]
        : [],
    [data]
  );
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
        <Shares title={title} />

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
          }}
        >
          <Box
            sx={{
              fontWeight: "500",
            }}
          >
            資源類型：
          </Box>
          <Tags tags={resourcesTags} />
        </Box>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
          }}
        >
          <Box
            sx={{
              fontWeight: "500",
            }}
          >
            標籤：
          </Box>
          <Tags tags={ageOfUserTags} />
        </Box>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
          }}
        >
          <Box
            sx={{
              fontWeight: "500",
            }}
          >
            年齡層：
          </Box>
          <Tags tags={tags} />
        </Box>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
          }}
        >
          <Box
            sx={{
              fontWeight: "500",
            }}
          >
            費用：
          </Box>
          <Tags tags={feeTags} />
        </Box>
        <p className="desc">{desc}</p>
        {Object.keys(disqusConfig).length > 0 && (
          <DiscussionEmbed
            shortname="dao-dao-a-xue"
            config={disqusConfig}
            width="100%"
            height={320}
          />
        )}
      </Paper>
    </ResourceWrapper>
  );
};

export default Resource;
