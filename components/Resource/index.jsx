import React, { useEffect, useMemo, useState } from "react";
import styled from "@emotion/styled";
import { useRouter } from "next/router";
import { Button, Paper, Box, Stack, Typography } from "@mui/material";
import Tags from "./Tags ";
import { postFetcher } from "../../utils/fetcher";
import { css } from "@emotion/react";
import { DiscussionEmbed, Recommendations, CommentEmbed } from "disqus-react";
import { Share } from "@mui/icons-material";
import { CopyToClipboard } from "react-copy-to-clipboard";
import toast from "react-hot-toast";
import Shares from "./Shares";
import appendQuery from "append-query";

const ResourceWrapper = styled(Paper)`
  margin: 50px auto;
  padding: 10px;
  width: 80%;
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
  .desc {
    font-size: 18px;
    margin: 10px 0;
  }

  @media (max-width: 767px) {
    width: 90%;
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
    width: 90%;
  }
`;

const Resource = ({ data, title, desc, image, tags }) => {
  const router = useRouter();
  const isLoading = useMemo(() => !data, [data]);
  const [disqusConfig, setDisqusConfig] = useState({});
  useEffect(() => {
    if (router.isReady) {
      setDisqusConfig({
        // url: `test-page.notion.dev.daoedu.tw${router.asPath}`,
        url: `${process.env.HOSTNAME}${router.asPath}`,
        identifier: encodeURIComponent(title),
        title: title,
        language: "zh_TW", //e.g. for Traditional Chinese (Taiwan)
      });
    }
  }, [router.asPath, router.isReady, title]);
  const link = useMemo(
    () =>
      data?.properties && data?.properties["連結"]
        ? appendQuery(
            data?.properties["連結"]?.url ?? "",
            "promotefrom=daoedu.tw"
          )
        : "",
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
  const catTags = useMemo(
    () => data?.properties["領域名稱"]?.multi_select ?? [],
    [data]
  );

  return (
    <ResourceWrapper>
      <a target="_blank" href={link} rel="noopener noreferrer">
        <Typography variant="h1" className="title">
          {title} 的資源介紹
        </Typography>
      </a>
      {/* <Image src={image} alt="image" layout="fill" /> */}
      <ImageWrapper
        onClick={() => window.open(link, "_blank")}
        image={image ?? "https://www.daoedu.tw/preview.webp"}
      />
      <Shares title={title} link={link} />
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
          領域名稱：
        </Box>
        <Tags tags={catTags} type="cats" />
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
          資源類型：
        </Box>
        <Tags tags={resourcesTags} type="tags" />
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
        <Tags tags={ageOfUserTags} type="ages" />
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
        <Tags tags={tags} type="tags" />
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
        <Tags tags={feeTags} type="fee" />
      </Box>
      <p className="desc">{desc}</p>
      <Box sx={{ marginTop: "20px" }}>
        {Object.keys(disqusConfig).length > 0 && (
          <DiscussionEmbed
            shortname="dao-dao-a-xue"
            config={disqusConfig}
            width="100%"
            height={320}
          />
        )}
      </Box>
    </ResourceWrapper>
  );
};

export default Resource;
