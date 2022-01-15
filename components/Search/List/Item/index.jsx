import React, { useMemo } from "react";
import styled from "@emotion/styled";
import { useRouter } from "next/router";
import { Skeleton } from "@mui/material";
import { css } from "@emotion/react";
// import Link from "next/link";
import Tags from "./Tags";

const ItemWrapper = styled.li`
  display: flex;
  /* justify-content: space-between;
  align-items: center; */
  margin: 10px 0;
`;
const ContentWrapper = styled.div`
  width: calc(100% - 200px);
  padding: 0 10px;
`;

const ImageWrapper = styled.div`
  width: 200px;
  height: 200px;
  ${({ image }) => css`
    background-image: ${`url(${image})`};
    background-size: cover;
    background-repeat: no-repeat;
    background-position: 50% 50%;
  `}
`;

const TitleWrapper = styled.h2`
  font-size: 24px;
  font-weight: 500;
  &:hover {
    cursor: pointer;
    color: #37b9eb;
    transition: 0.5s;
  }
`;

const Item = ({ data }) => {
  const hashtags = useMemo(
    () => data?.properties["標籤 / Hashtag"]?.multi_select,
    [data]
  );
  const resourcesTags = useMemo(
    () => data?.properties["資源類型"]?.multi_select,
    [data]
  );
  const feetags = useMemo(() => [data?.properties["費用"]?.select], [data]);
  const areatags = useMemo(() => [data?.properties["地區"]?.select], [data]);
  const ageOfUserTags = useMemo(
    () => data?.properties["年齡層 / Age of users"]?.multi_select,
    [data]
  );

  const link = useMemo(() => data?.properties["連結 / Link"]?.url, [data]);

  return (
    <ItemWrapper>
      <ImageWrapper
        image={
          data?.properties["縮圖 / Thumbnail"]?.files[0].name ?? "/preview.webp"
        }
      />
      <ContentWrapper>
        <TitleWrapper onClick={() => window.open(link, "_blank")}>
          {data?.properties["資源名稱 / Name"]?.title[0]?.plain_text ?? ""}
        </TitleWrapper>
        <Tags tags={[...resourcesTags, ...hashtags, ...feetags, ...areatags]} />
        <Tags tags={ageOfUserTags} />
        {/* <Skeleton variant="text" />
        <Skeleton variant="text" /> */}
      </ContentWrapper>
    </ItemWrapper>
  );
};

export default Item;
