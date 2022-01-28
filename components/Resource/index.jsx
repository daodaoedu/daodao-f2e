import React, { useMemo } from "react";
import { useRouter } from "next/router";
import styled from "@emotion/styled";
import { Paper } from "@mui/material";
import useSWRImmutable from "swr/immutable";
import Tags from "./Tags";
import { postFetcher } from "../../utils/fetcher";

const ResourceWrapper = styled.section`
  padding-top: 40px;
  padding-bottom: 40px;
`;

const Resource = () => {
  const { query } = useRouter();
  // 理論上要用ID搜尋比較適合，但是notion目前沒有提供這種篩選方式，以後需要調整
  const { data: responseData } = useSWRImmutable(
    [
      `https://api.daoedu.tw/notion/databases`,
      {
        filter: {
          and: [
            {
              property: "資源名稱",
              title: {
                contains: query.title,
              },
            },
          ],
        },
      },
    ],
    postFetcher
  );
  //   const data = useMemo(
  //     () => responseData?.payload?.results[0] ?? {},
  //     [responseData?.payload?.results]
  //   );
  const isLoading = useMemo(() => !responseData, [responseData]);
  const link = useMemo(
    () =>
      Array.isArray(responseData?.payload?.results)
        ? responseData?.payload?.results[0]?.properties["連結"]?.url
        : "",
    [responseData, responseData?.payload?.results]
  );
  const tags = useMemo(
    () =>
      Array.isArray(responseData?.payload?.results)
        ? responseData?.payload?.results[0]?.properties["標籤"]?.multi_select
        : [],
    [responseData, responseData?.payload?.results]
  );

  console.log("data", responseData?.payload?.results);
  console.log("responseData", responseData);
  console.log("tags", tags);
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
        <h1 className="title" onClick={() => window.open(link, "_blank")}>
          {Array.isArray(responseData?.payload?.results)
            ? responseData?.payload?.results[0]?.properties["資源名稱"]
                ?.title[0]?.plain_text
            : ""}{" "}
          的資源介紹
        </h1>
        <Tags tags={tags} />
        <p className="desc">
          {Array.isArray(responseData?.payload?.results)
            ? responseData?.payload?.results[0]?.properties["介紹"]
                ?.rich_text[0]?.plain_text
            : ""}
        </p>
      </Paper>
    </ResourceWrapper>
  );
};

export default Resource;
