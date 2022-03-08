import React, { useMemo } from "react";
import styled from "@emotion/styled";
import { css } from "@emotion/react";
import Link from "next/link";
import Tags from "./Tags";
import { Typography, Box } from "@mui/material";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import LogoImage from "./LogoImage";
import Contributors from "./Contributors";
dayjs.extend(isBetween);

const ItemWrapper = styled.li`
  display: flex;
  padding-top: 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid rgba(168, 168, 168, 0.3);
`;
const ContentWrapper = styled.div`
  width: calc(100% - 200px);
  padding: 0 10px;
  margin-left: 20px;
  @media (max-width: 767px) {
    width: calc(100% - 100px);
  }
`;

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
  ${({ isNewResource }) =>
    isNewResource &&
    css`
      position: absolute;
      top: 20px;
      right: -28px;
      height: 25px;
      width: 120px;
      background-color: #16b9b3;
      opacity: 0.7;
      color: white;
      transform: rotate(45deg);
    `}
`;

const TitleWrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-start;
  align-items: center;
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

const Item = ({ data, queryTags }) => {
  const hashTags = useMemo(
    () => data?.properties["標籤"]?.multi_select ?? [],
    [data]
  );
  const resourcesTags = useMemo(
    () => data?.properties["資源類型"]?.multi_select ?? [],
    [data]
  );
  const feeTags = useMemo(
    () =>
      data?.properties["費用"]?.select
        ? [data?.properties["費用"]?.select]
        : [],
    [data]
  );

  const isNewResource = useMemo(() => {
    const today = dayjs();
    const createDay = dayjs(data?.created_time);
    const isRecent = dayjs(createDay).isBetween(
      today,
      dayjs(today).subtract(1, "month")
    );
    return isRecent;
  }, [data]);

  const ageOfUserTags = useMemo(
    () => data?.properties["年齡層"]?.multi_select ?? [],
    [data]
  );

  const title = useMemo(
    () =>
      (data?.properties["資源名稱"]?.title ?? []).find(
        (item) => item?.type === "text"
      )?.plain_text,
    [data?.properties]
  );

  const contributors = useMemo(
    () => data?.properties["創建者"]?.multi_select ?? [],
    [data?.properties]
  );

  // const link = useMemo(() => data?.properties["連結"]?.url ?? "", [data]);
  const link = useMemo(() => `/resource/${title}`, [title]);

  return (
    <ItemWrapper>
      <LogoImage isNewResource={isNewResource} link={link} data={data} />
      <ContentWrapper>
        <TitleWrapper>
          <a target="_blank" href={link} rel="noopener noreferrer">
            <h2 className="title">{`📌 ${title ?? "未命名"}`}</h2>
          </a>
          <Tags type="fee" tags={feeTags} />
          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-start",
              alignItems: "center",
              margin: "0 5px",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/assets/animated-fire.gif"
              alt="animated-fire"
              width={30}
              height={30}
            />
            <Typography sx={{ marginLeft: "5px", fontWeight: "bold" }}>
              合作夥伴
            </Typography>
          </Box>
        </TitleWrapper>
        <Tags
          type="tags"
          tags={[...resourcesTags, ...hashTags]}
          queryTags={queryTags}
        />
        <Tags type="ages" tags={ageOfUserTags} />
        {contributors.length > 0 && (
          <Contributors contributors={contributors} />
        )}
      </ContentWrapper>
    </ItemWrapper>
  );
};

export default Item;
